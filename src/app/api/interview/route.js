import { auth } from "@clerk/nextjs/server";

import { createInterview } from "@/server/services/interview.service";
import { evaluateInterview } from "@/server/ai/mistral";

// Scoring is an LLM call; give it room.
export const maxDuration = 60;

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

    if (questions.length === 0) {
      return Response.json(
        { success: false, message: "No interview questions to score." },
        { status: 400 }
      );
    }

    const qa = questions.map((question, i) => ({
      question,
      answer: answers[i] ?? "",
    }));

    const assessment = await evaluateInterview({ role, experienceLevel, qa });

    const interview = await createInterview(userId, {
      role,
      experienceLevel,
      questions,
      answers,
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
