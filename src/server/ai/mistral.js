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
          "skills, projects, technologies, and experience. Also ask a few fundamental " +
          "questions from the mentioned techstack in the resume. Respond ONLY with JSON of the form " +
          '{"questions": [{"text": "...", "topic": "...", "difficulty": "easy|medium|hard"}]}. ' +
          "`topic` is a concise label such as \"System Design\", \"React\", \"SQL\" or " +
          "\"Behavioral\". Reuse the exact same topic label for every question that " +
          "covers that area so sessions can be balanced across topics.",
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
