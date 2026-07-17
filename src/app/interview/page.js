import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  getNextQuestions,
  QUESTION_COUNT,
} from "@/server/services/question.service";
import { InterviewSession } from "@/features/interview/InterviewSession";

export default async function InterviewPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Draws from the bank generated at upload time, preferring questions this
  // user hasn't been asked before.
  const { role, experienceLevel, questions, poolSize, unaskedCount } =
    await getNextQuestions(userId, QUESTION_COUNT);

  return (
    <InterviewSession
      role={role}
      experienceLevel={experienceLevel}
      questions={questions}
      poolSize={poolSize}
      unaskedCount={unaskedCount}
    />
  );
}
