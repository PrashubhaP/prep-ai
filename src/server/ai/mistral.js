/**
 * Mistral AI integration.
 *
 * Two capabilities are used:
 *   1. OCR  (`/v1/ocr/process`)          — read text out of an uploaded resume PDF.
 *   2. Chat (`/v1/chat/completions`)     — turn that text into tailored questions.
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

/**
 * Generate interview questions tailored to the candidate's resume and target role.
 * @returns {Promise<string[]>} Exactly `count` questions.
 */
export async function generateInterviewQuestions({
  resumeText,
  role,
  experienceLevel,
  count = 5,
}) {
  const data = await mistralFetch("/chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. You create sharp, personalized " +
          "interview questions grounded in the candidate's actual resume — their " +
          "skills, projects, technologies, and experience. Avoid generic questions " +
          "that ignore the resume. Respond ONLY with JSON of the form " +
          '{"questions": ["...", "..."]}.',
      },
      {
        role: "user",
        content:
          `Target role: ${role || "Not specified"}\n` +
          `Experience level: ${experienceLevel || "Not specified"}\n\n` +
          `Generate exactly ${count} interview questions tailored to the resume below. ` +
          `Mix technical depth with questions about the candidate's specific projects ` +
          `and experience. Calibrate difficulty to the experience level.\n\n` +
          `--- RESUME ---\n${resumeText}`,
      },
    ],
  });

  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);

  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  const cleaned = questions
    .filter((q) => typeof q === "string" && q.trim())
    .map((q) => q.trim())
    .slice(0, count);

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

/**
 * Evaluate a completed interview and return a structured assessment.
 * @param {object} params
 * @param {string} params.role
 * @param {string} params.experienceLevel
 * @param {Array<{question: string, answer: string}>} params.qa
 * @returns {Promise<{score:number, strengths:string[], improvements:string[], weakAreas:string[]}>}
 */
export async function evaluateInterview({ role, experienceLevel, qa }) {
  const transcript = qa
    .map(
      (item, i) =>
        `Q${i + 1}: ${item.question}\nA${i + 1}: ${
          (item.answer || "").slice(0, MAX_ANSWER_CHARS) || "(no answer)"
        }`
    )
    .join("\n\n");

  const data = await mistralFetch("/chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.2,
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
          '"improvements": ["..."], "weakAreas": ["short topic tag", "..."]}. ' +
          "weakAreas are concise topic labels (e.g. \"System Design\", \"SQL\").",
      },
      {
        role: "user",
        content:
          `Target role: ${role || "Not specified"}\n` +
          `Experience level: ${experienceLevel || "Not specified"}\n\n` +
          `Grade this interview transcript:\n\n${transcript}`,
      },
    ],
  });

  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);

  return {
    score: clampScore(parsed.score),
    strengths: toStringList(parsed.strengths),
    improvements: toStringList(parsed.improvements),
    weakAreas: toStringList(parsed.weakAreas),
  };
}
