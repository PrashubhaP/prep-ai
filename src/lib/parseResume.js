import { extractText, getDocumentProxy } from "unpdf";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function extractTextFromPDF(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8Array);
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

// --------------------
// Resume Analysis
// --------------------
export async function generateInterviewQuestions({
  resume,
  previousQuestions = [],
}) {
  const prompt = `
You are an experienced technical interviewer.

Your task is to conduct a personalized mock interview.

==============================
Candidate Profile
==============================

Role:
${resume.role}

Experience Level:
${resume.experienceLevel}

Skills:
${resume.extractedSkills?.join(", ") || "None"}

Technologies:
${resume.technologies?.join(", ") || "None"}

Projects:
${resume.projects?.join("\n") || "None"}

==============================
Previously Asked Questions
==============================

${
previousQuestions.length
? previousQuestions.map((q,i)=>`${i+1}. ${q}`).join("\n")
: "None"
}

==============================
Instructions
==============================

Generate EXACTLY FIVE interview questions.

Requirements:

• Questions MUST match the selected role.

• Questions MUST match the experience level.

• Questions MUST primarily be based on the candidate's resume.

• Ask about technologies the candidate actually used.

• Ask about projects mentioned in the resume.

• Ask about implementation decisions.

• Ask about challenges faced.

• Ask one scenario-based question.

• Ask one behavioral question.

• Do NOT ask generic interview questions.

• Do NOT repeat any previous question.

Return ONLY JSON.

{
  "questions":[
    {
      "questionText":"...",
      "category":"technical"
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text.trim();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);

  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate interview questions.");
  }
}