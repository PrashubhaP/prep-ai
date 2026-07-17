import { auth } from "@clerk/nextjs/server";

import { createInterview } from "@/server/services/interview.service";
import { evaluateInterview } from "@/server/ai/mistral";

// Scoring is an LLM call; give it room.
export const maxDuration = 60;

/**
 * Accept both the `{text, topic}` objects the session serves today and the bare
 * strings older clients sent.
 */
function normalizeQuestion(value) {
  if (typeof value === "string") {
    return { text: value, topic: "General" };
  }
  return {
    text: String(value?.text ?? ""),
    topic: value?.topic || "General",
  };
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      role = "",
      experienceLevel = "",
      questions = [],
      answers = [],
    } = await req.json();

    const asked = questions.map(normalizeQuestion).filter((q) => q.text.trim());

    if (asked.length === 0) {
      return Response.json(
        { success: false, message: "No interview questions to score." },
        { status: 400 }
      );
    }

    const qa = asked.map((question, i) => ({
      question: question.text,
      topic: question.topic,
      answer: answers[i] ?? "",
    }));

    const assessment = await evaluateInterview({ role, experienceLevel, qa });

    const interview = await createInterview(userId, {
      role,
      experienceLevel,
      // Flat mirrors, kept alongside the graded `responses` in the assessment.
      questions: qa.map((item) => item.question),
      answers: qa.map((item) => item.answer),
      ...assessment,
    });

    return Response.json({ success: true, interviewId: String(interview._id) });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
