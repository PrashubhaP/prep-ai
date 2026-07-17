/**
 * Mistral AI integration.
 *
 * Two capabilities are used:
 *   1. OCR  (`/v1/ocr`)                  — read text out of an uploaded resume PDF.
 *   2. Chat (`/v1/chat/completions`)     — turn that text into tailored questions.
 *
 * Implemented with plain `fetch` so no extra SDK dependency is required. All
 * calls are server-only; the API key never leaves the backend.
 */

const API_BASE = "https://api.mistral.ai/v1";
const OCR_MODEL = "mistral-ocr-latest";
const CHAT_MODEL = "mistral-medium-latest";

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

const QUESTION_SYSTEM_PROMPT =
  "You are an expert technical interviewer. You create sharp, personalized " +
  "interview questions grounded in the candidate's actual resume — their " +
  "skills, projects, technologies, and experience. Also ask a few fundamental " +
  "questions from the mentioned techstack in the resume. Respond ONLY with JSON of the form " +
  '{"questions": [{"text": "...", "topic": "...", "difficulty": "easy|medium|hard"}]}. ' +
  "`topic` is a concise label such as \"System Design\", \"React\", \"SQL\" or " +
  "\"Behavioral\". Reuse the exact same topic label for every question that " +
  "covers that area so sessions can be balanced across topics.";

/**
 * The pool is generated as several focused batches instead of one big request.
 * A single 50-question completion has to stream ~all its tokens sequentially
 * and dominates upload time; these batches run concurrently, so the wall-clock
 * cost is roughly one small batch. Distinct focuses also keep overlap down and
 * the bank spread across areas.
 */
const GENERATION_BATCHES = [
  "core computer-science and language fundamentals behind the candidate's tech stack",
  "the candidate's specific projects and the decisions and trade-offs they made in them",
  "the specific frameworks, libraries, databases and tools named on the resume",
  "system design, architecture and scalability appropriate to the target role",
  "behavioral and situational questions about collaboration, ownership and past challenges",
];

/** One chat call: a batch of questions focused on a single area. */
async function generateQuestionBatch({
  resumeText,
  role,
  experienceLevel,
  count,
  focus,
}) {
  const data = await mistralFetch("/chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.7,
    // A single batch is small, so this comfortably fits without truncating.
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: QUESTION_SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Target role: ${role || "Not specified"}\n` +
          `Experience level: ${experienceLevel || "Not specified"}\n\n` +
          `Generate ${count} distinct interview questions tailored to the resume ` +
          `below, focused on ${focus}.\n\n` +
          `Requirements:\n` +
          `- Ground every question in the resume; avoid generic questions.\n` +
          `- Include a spread of easy, medium and hard, calibrated to the ` +
          `experience level.\n` +
          `- No two questions may ask the same thing in different words.\n\n` +
          `--- RESUME ---\n${resumeText}`,
      },
    ],
  });

  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.questions) ? parsed.questions : [];
}

/**
 * Generate a bank of interview questions tailored to the candidate's resume and
 * target role. The whole pool is generated once, then sessions draw a handful
 * at a time, so `count` is deliberately much larger than a single sitting.
 *
 * The batches are generated in parallel and merged; only the whole set failing
 * is an error, so a slow or dropped batch still yields a usable pool.
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
  // A little padding per batch absorbs the duplicates that dedup will drop.
  const perBatch = Math.ceil(count / GENERATION_BATCHES.length) + 2;

  const settled = await Promise.allSettled(
    GENERATION_BATCHES.map((focus) =>
      generateQuestionBatch({ resumeText, role, experienceLevel, count: perBatch, focus })
    )
  );

  const batches = settled
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  if (batches.length === 0) {
    // Every batch failed — surface a real error rather than an empty pool.
    const firstError = settled.find((r) => r.status === "rejected");
    throw firstError?.reason ?? new Error("Mistral returned no questions.");
  }

  // Round-robin across batches so capping at `count` never drops a whole focus
  // area — each contributes questions evenly. Duplicates across batches (the
  // model occasionally repeats itself) are collapsed by normalized text.
  const seen = new Set();
  const cleaned = [];
  const cursors = batches.map(() => 0);

  let addedThisPass = true;
  while (addedThisPass && cleaned.length < count) {
    addedThisPass = false;

    for (let b = 0; b < batches.length && cleaned.length < count; b++) {
      const batch = batches[b];
      let i = cursors[b];

      // Take this batch's next question that isn't blank or a duplicate.
      while (i < batch.length) {
        const item = batch[i];
        i++;

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
        addedThisPass = true;
        break;
      }

      cursors[b] = i;
    }
  }

  if (cleaned.length === 0) {
    throw new Error("Mistral returned no questions.");
  }

  return cleaned;
}
