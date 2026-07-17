/**
 * Mistral AI integration.
 *
 * Two capabilities are used:
 *   1. OCR  (`/v1/ocr`)                  — read text out of an uploaded resume PDF.
 *   2. Chat (`/v1/chat/completions`)     — turn that text into tailored questions,
 *                                          and grade the answers that come back.
 *
 * Implemented with plain `fetch` so no extra SDK dependency is required. All
 * calls are server-only; the API key never leaves the backend.
 */

const API_BASE = "https://api.mistral.ai/v1";
const OCR_MODEL = "mistral-ocr-latest";
const CHAT_MODEL = "mistral-large-latest";

// Keep the prompt bounded so a very long resume can't blow up the request.
const MAX_RESUME_CHARS = 12000;

function getApiKey() {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error("MISTRAL_API_KEY is not configured.");
  }
  return key;
}

async function mistralFetch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Mistral request to ${path} failed (${res.status}): ${detail.slice(0, 300)}`
    );
  }

  return res.json();
}

/**
 * Extract plain text from a resume PDF using Mistral OCR.
 * @param {string} base64Pdf - Base64-encoded PDF (without the data URI prefix).
 * @returns {Promise<string>} The resume text, concatenated across pages.
 */
export async function extractResumeText(base64Pdf) {
  const data = await mistralFetch("/ocr", {
    model: OCR_MODEL,
    document: {
      type: "document_url",
      document_url: `data:application/pdf;base64,${base64Pdf}`,
    },
    include_image_base64: false,
  });

  const text = (data.pages ?? [])
    .map((page) => page.markdown ?? "")
    .join("\n\n")
    .trim();

  return text.slice(0, MAX_RESUME_CHARS);
}

const DIFFICULTIES = ["easy", "medium", "hard"];

function normalizeDifficulty(value) {
  const d = String(value ?? "").toLowerCase().trim();
  return DIFFICULTIES.includes(d) ? d : "medium";
}

/** Questions are compared by normalized text so near-duplicates collapse. */
export function questionKey(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Generate a bank of interview questions tailored to the candidate's resume and
 * target role. The whole pool is generated once, then sessions draw a handful
 * at a time, so `count` is deliberately much larger than a single sitting.
 *
 * @returns {Promise<Array<{text: string, topic: string, difficulty: string}>>}
 *   Up to `count` unique questions. The model may return slightly fewer; that is
 *   not treated as an error as long as at least one came back.
 */
export async function generateInterviewQuestions({
  resumeText,
  role,
  experienceLevel,
  count = 50,
}) {
  const data = await mistralFetch("/chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.7,
    // A 50-question bank runs well past the default output ceiling; without
    // this the JSON comes back truncated and unparseable.
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. You create sharp, personalized " +
          "interview questions grounded in the candidate's actual resume — their " +
          "skills, projects, technologies, and experience. Avoid generic questions " +
          "that ignore the resume. Respond ONLY with JSON of the form " +
          '{"questions": [{"text": "...", "topic": "...", "difficulty": "easy|medium|hard"}]}. ' +
          "`topic` is a concise label such as \"System Design\", \"React\", \"SQL\" or " +
          "\"Behavioral\". Reuse the exact same topic label for every question that " +
          "covers that area — the labels are aggregated across sessions to track " +
          "progress, so inconsistent spellings corrupt the analysis.",
      },
      {
        role: "user",
        content:
          `Target role: ${role || "Not specified"}\n` +
          `Experience level: ${experienceLevel || "Not specified"}\n\n` +
          `Generate ${count} distinct interview questions tailored to the resume below.\n\n` +
          `Requirements:\n` +
          `- Spread them across roughly 6-10 topics, so no single topic dominates.\n` +
          `- Mix technical depth with questions about the candidate's specific ` +
          `projects and experience, and include some behavioral questions.\n` +
          `- Include a spread of easy, medium and hard, calibrated to the ` +
          `experience level.\n` +
          `- No two questions may ask the same thing in different words.\n\n` +
          `--- RESUME ---\n${resumeText}`,
      },
    ],
  });

  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  const raw = Array.isArray(parsed.questions) ? parsed.questions : [];

  // The model occasionally repeats itself across a bank this large, and a
  // duplicate would burn a slot in the rotation without asking anything new.
  const seen = new Set();
  const cleaned = [];

  for (const item of raw) {
    const text = typeof item === "string" ? item : item?.text;
    if (typeof text !== "string" || !text.trim()) continue;

    const key = questionKey(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      text: text.trim(),
      topic: String(item?.topic ?? "").trim() || "General",
      difficulty: normalizeDifficulty(item?.difficulty),
    });

    if (cleaned.length === count) break;
  }

  if (cleaned.length === 0) {
    throw new Error("Mistral returned no questions.");
  }

  return cleaned;
}

// Keep each answer bounded so a long-winded candidate can't blow up the prompt.
const MAX_ANSWER_CHARS = 1500;

function clampScore(value) {
  const n = Math.round(Number(value));
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function toStringList(value) {
  return Array.isArray(value)
    ? value.filter((v) => typeof v === "string" && v.trim()).map((v) => v.trim())
    : [];
}

// An answer scoring below this is treated as a weakness in that topic.
const WEAK_SCORE = 60;

/**
 * Evaluate a completed interview, grading every answer individually as well as
 * the sitting as a whole.
 *
 * Topics are carried through from the question pool rather than asked of the
 * grader: the dashboard aggregates scores by topic across sessions, so the
 * labels have to come from one stable source.
 *
 * @param {object} params
 * @param {string} params.role
 * @param {string} params.experienceLevel
 * @param {Array<{question: string, answer: string, topic?: string}>} params.qa
 * @returns {Promise<{score:number, strengths:string[], improvements:string[],
 *   weakAreas:string[], responses:Array<{question:string, answer:string,
 *   topic:string, score:number, feedback:string}>}>}
 */
export async function evaluateInterview({ role, experienceLevel, qa }) {
  const transcript = qa
    .map(
      (item, i) =>
        `Q${i + 1} [${item.topic || "General"}]: ${item.question}\nA${i + 1}: ${
          (item.answer || "").slice(0, MAX_ANSWER_CHARS) || "(no answer)"
        }`
    )
    .join("\n\n");

  const data = await mistralFetch("/chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior technical interviewer grading a mock interview. " +
          "Assess the answers for correctness, depth, and communication, " +
          "calibrated to the candidate's target role and experience level. Be " +
          "fair but rigorous; empty or vague answers score low. Respond ONLY " +
          "with JSON of the form " +
          '{"score": <0-100 integer>, "strengths": ["..."], ' +
          '"improvements": ["..."], "responses": [{"index": <1-based question ' +
          'number>, "score": <0-100 integer>, "feedback": "one or two sentences ' +
          'on this specific answer"}]}. ' +
          "Include exactly one `responses` entry per question asked. `score` is " +
          "the overall assessment and need not be the mean of the per-answer " +
          "scores. `improvements` are specific, actionable next steps.",
      },
      {
        role: "user",
        content:
          `Target role: ${role || "Not specified"}\n` +
          `Experience level: ${experienceLevel || "Not specified"}\n\n` +
          `Grade this interview transcript. It has ${qa.length} question(s), so ` +
          `return exactly ${qa.length} "responses" entries.\n\n${transcript}`,
      },
    ],
  });

  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);

  // Index the graded answers so they can be matched back to the questions we
  // actually asked. Anything the model skipped falls back to a zero score
  // rather than silently shifting later answers onto the wrong question.
  const graded = new Map();
  if (Array.isArray(parsed.responses)) {
    for (const item of parsed.responses) {
      const index = Number(item?.index);
      if (Number.isInteger(index)) graded.set(index, item);
    }
  }

  const responses = qa.map((item, i) => {
    const match = graded.get(i + 1);
    return {
      question: item.question,
      answer: item.answer ?? "",
      topic: item.topic || "General",
      score: clampScore(match?.score),
      feedback:
        typeof match?.feedback === "string" ? match.feedback.trim() : "",
    };
  });

  // Derived rather than model-reported: a weak area is simply a topic whose
  // answers scored poorly, which keeps the tags consistent with the numbers
  // shown next to them.
  const weakAreas = [
    ...new Set(
      responses.filter((r) => r.score < WEAK_SCORE).map((r) => r.topic)
    ),
  ];

  return {
    score: clampScore(parsed.score),
    strengths: toStringList(parsed.strengths),
    improvements: toStringList(parsed.improvements),
    weakAreas,
    responses,
  };
}
