import { extractText, getDocumentProxy } from "unpdf";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// -------------------------
// Extract PDF Text
// -------------------------
export async function extractTextFromPDF(buffer) {
  const uint8Array = new Uint8Array(buffer);

  const pdf = await getDocumentProxy(uint8Array);

  const { text } = await extractText(pdf, {
    mergePages: true,
  });

  return text;
}

// -------------------------
// Analyze Resume + Generate Questions
// -------------------------
export async function analyzeResumeAndGenerateQuestions(
  resumeText,
  role,
  experienceLevel
) {
  const prompt = `
You are an expert technical interviewer.

First analyze the resume.

Extract:

- skills
- technologies
- projects

Then generate EXACTLY 50 UNIQUE interview questions.

The questions MUST be based on:

- extracted skills
- extracted technologies
- extracted projects
- Role: ${role}
- Experience Level: ${experienceLevel}

Rules:

- Make every question personalized.
- Do NOT repeat questions.
- Mix technical, behavioral, project and scenario questions.
- Questions should become gradually harder.
- Return ONLY valid JSON.

Format:

{
  "skills": [],
  "technologies": [],
  "projects": [],
  "questions": [
    {
      "questionText": "...",
      "category": "technical"
    }
  ]
}

Resume:

${resumeText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  let text = response.text;

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(text);
}