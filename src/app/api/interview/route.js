import { auth } from "@clerk/nextjs/server";

import { createInterview } from "@/server/services/interview.service";

/** Reduce a served question to the fields we store: its text and topic. */
function normalizeQuestion(value) {
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
        { success: false, message: "No interview questions to save." },
        { status: 400 }
      );
    }

    // Pair each question with the answer the candidate gave. The topic travels
    // with the question so it's stored alongside the answer.
    const responses = asked.map((question, i) => ({
      question: question.text,
      topic: question.topic,
      answer: answers[i] ?? "",
    }));

    const interview = await createInterview(userId, {
      role,
      experienceLevel,
      responses,
    });

    return Response.json({ success: true, interviewId: String(interview._id) });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
