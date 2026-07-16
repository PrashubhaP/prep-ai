import mongoose from "mongoose";

import connectDB from "@/server/db";
import Interview from "@/server/models/Interview";

export async function createInterview(userId, data) {
  await connectDB();
  return Interview.create({ userId, ...data });
}

export async function getInterviewById(userId, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return Interview.findOne({ _id: id, userId });
}

export async function getUserInterviews(userId) {
  await connectDB();
  return Interview.find({ userId }).sort({ createdAt: 1 });
}

/**
 * Count occurrences across a list of interviews' string arrays and return the
 * most frequent values.
 */
function topByFrequency(interviews, field, limit) {
  const counts = new Map();
  for (const interview of interviews) {
    for (const value of interview[field] ?? []) {
      const key = value.trim();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function readinessFromScore(average) {
  if (average === null) return "—";
  if (average >= 80) return "Strong";
  if (average >= 65) return "Good";
  if (average >= 50) return "Fair";
  return "Needs work";
}

/**
 * Aggregate a user's interview history into the numbers the dashboard shows.
 */
export async function getInterviewStats(userId) {
  const interviews = await getUserInterviews(userId);

  const total = interviews.length;
  const averageScore =
    total > 0
      ? Math.round(
          interviews.reduce((sum, i) => sum + (i.score ?? 0), 0) / total
        )
      : null;

  const trend = interviews.map((interview, index) => ({
    session: String(index + 1),
    score: interview.score ?? 0,
  }));

  // Most recent first for the "Previous Interviews" list.
  const previousInterviews = [...interviews]
    .reverse()
    .map((interview) => ({
      id: String(interview._id),
      role: interview.role || "Interview",
      date: new Date(interview.createdAt).toISOString().slice(0, 10),
      score: interview.score ?? 0,
    }));

  return {
    total,
    averageScore,
    readiness: readinessFromScore(averageScore),
    weakAreas: topByFrequency(interviews, "weakAreas", 3),
    suggestions: topByFrequency(interviews, "improvements", 3),
    trend,
    previousInterviews,
  };
}
