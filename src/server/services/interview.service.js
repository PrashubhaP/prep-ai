import connectDB from "@/server/db";
import Interview from "@/server/models/Interview";

export async function createInterview(userId, data) {
  await connectDB();
  return Interview.create({ userId, ...data });
}

export async function getUserInterviews(userId) {
  await connectDB();
  return Interview.find({ userId }).sort({ createdAt: 1 });
}

/**
 * Turn an interview history into the numbers the dashboard shows. Pure — kept
 * separate from the database read so it can be exercised directly.
 *
 * @param {Array} interviews - Chronologically ordered.
 */
export function aggregateStats(interviews) {
  // Most recent first for the "Previous Interviews" list.
  const previousInterviews = [...interviews].reverse().map((interview) => ({
    id: String(interview._id),
    role: interview.role || "Interview",
    date: new Date(interview.createdAt).toISOString().slice(0, 10),
    questionCount: interview.responses?.length || 0,
  }));

  return {
    total: interviews.length,
    previousInterviews,
  };
}

/**
 * Aggregate a user's interview history into the numbers the dashboard shows.
 */
export async function getInterviewStats(userId) {
  return aggregateStats(await getUserInterviews(userId));
}
