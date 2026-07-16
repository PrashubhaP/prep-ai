import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getLatestResume } from "@/server/services/resume.service";
import { questions as staticQuestions } from "@/data/questions";
import { InterviewSession } from "@/features/interview/InterviewSession";

// Number of questions asked per interview. Caps older resumes that stored more.
const QUESTION_COUNT = 5;

export default async function InterviewPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const resume = await getLatestResume(userId);
  const role = resume?.role || "Frontend Developer";
  const experienceLevel = resume?.experienceLevel || "";

  // Prefer the questions generated from the user's resume; fall back to the
  // generic question bank if none were generated (e.g. older resumes).
  const source =
    resume?.questions?.length > 0
      ? [...resume.questions]
      : staticQuestions[role] ?? [];
  const questions = source.slice(0, QUESTION_COUNT);

  return (
    <InterviewSession
      role={role}
      experienceLevel={experienceLevel}
      questions={questions}
    />
  );
}
