import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  getInterviewById,
  getUserInterviews,
} from "@/server/services/interview.service";
import { FeedbackReport } from "@/features/feedback/FeedbackReport";

const serialize = (doc) => (doc ? JSON.parse(JSON.stringify(doc)) : null);

export default async function FeedbackPage({ searchParams }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { id } = await searchParams;

  // Load the requested interview, or fall back to the user's most recent one.
  let interview = id ? await getInterviewById(userId, id) : null;
  if (!interview) {
    const all = await getUserInterviews(userId);
    interview = all.at(-1) ?? null;
  }

  const result = interview
    ? {
        score: interview.score,
        strengths: interview.strengths,
        improvements: interview.improvements,
      }
    : null;

  return <FeedbackReport result={serialize(result)} />;
}
