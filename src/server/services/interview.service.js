import mongoose from "mongoose";

import connectDB from "@/server/db";
import Interview from "@/server/models/Interview";

// A topic averaging below this is surfaced as a weak area.
const WEAK_TOPIC_SCORE = 70;

// How many of the latest sittings count as "recent" when measuring movement.
const RECENT_WINDOW = 3;

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

function average(numbers) {
  if (numbers.length === 0) return null;
  return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
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
 * Average every graded answer by topic, and measure whether each topic is
 * moving. Interviews recorded before per-question grading have no `responses`
 * and simply contribute nothing here.
 *
 * @param {Array} interviews - Chronologically ordered.
 * @returns {Array<{topic, average, answered, delta}>} Weakest topic first.
 */
function topicBreakdown(interviews) {
  const byTopic = new Map();

  interviews.forEach((interview, index) => {
    for (const response of interview.responses ?? []) {
      const topic = (response.topic || "General").trim();
      if (!byTopic.has(topic)) byTopic.set(topic, []);
      byTopic.get(topic).push({ score: response.score ?? 0, index });
    }
  });

  const recentFrom = interviews.length - RECENT_WINDOW;

  return [...byTopic.entries()]
    .map(([topic, entries]) => {
      const scores = entries.map((e) => e.score);
      const recent = entries.filter((e) => e.index >= recentFrom);
      const earlier = entries.filter((e) => e.index < recentFrom);

      const recentAverage = average(recent.map((e) => e.score));
      const earlierAverage = average(earlier.map((e) => e.score));

      return {
        topic,
        average: average(scores),
        answered: scores.length,
        // Only meaningful once a topic has been seen both inside and outside
        // the recent window; otherwise there's nothing to compare against.
        delta:
          recentAverage !== null && earlierAverage !== null
            ? recentAverage - earlierAverage
            : null,
      };
    })
    .sort((a, b) => a.average - b.average);
}

/**
 * Collect improvement suggestions, most recent first.
 *
 * These are free-text sentences from the grader, so they essentially never
 * repeat verbatim — ranking them by frequency (as this once did) produced an
 * arbitrary order. Recency is the honest signal: the newest advice reflects
 * where the candidate stands now.
 */
function recentSuggestions(interviews, limit) {
  const seen = new Set();
  const suggestions = [];

  for (let i = interviews.length - 1; i >= 0; i--) {
    for (const value of interviews[i].improvements ?? []) {
      const text = value.trim();
      if (!text) continue;

      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      suggestions.push(text);
      if (suggestions.length === limit) return suggestions;
    }
  }

  return suggestions;
}

/**
 * Turn an interview history into the numbers the dashboard shows. Pure — kept
 * separate from the database read so the aggregation can be exercised directly.
 *
 * @param {Array} interviews - Chronologically ordered.
 */
export function aggregateStats(interviews) {
  const total = interviews.length;
  const scores = interviews.map((i) => i.score ?? 0);
  const averageScore = average(scores);

  const trend = interviews.map((interview, index) => ({
    session: String(index + 1),
    score: interview.score ?? 0,
    date: new Date(interview.createdAt).toISOString().slice(0, 10),
  }));

  // Movement across the whole history: how the recent sittings compare with
  // everything before them.
  const recentAverage = average(scores.slice(-RECENT_WINDOW));
  const earlierAverage = average(scores.slice(0, -RECENT_WINDOW));
  const trendDelta =
    recentAverage !== null && earlierAverage !== null
      ? recentAverage - earlierAverage
      : null;

  const topics = topicBreakdown(interviews);

  // Prefer topics backed by real per-answer scores; fall back to the grader's
  // tags for histories recorded before per-question grading existed.
  const scoredWeakAreas = topics
    .filter((t) => t.average < WEAK_TOPIC_SCORE)
    .slice(0, 3)
    .map((t) => t.topic);

  const weakAreas =
    topics.length > 0
      ? scoredWeakAreas
      : topByFrequency(interviews, "weakAreas", 3);

  // Most recent first for the "Previous Interviews" list.
  const previousInterviews = [...interviews].reverse().map((interview) => ({
    id: String(interview._id),
    role: interview.role || "Interview",
    date: new Date(interview.createdAt).toISOString().slice(0, 10),
    score: interview.score ?? 0,
  }));

  return {
    total,
    averageScore,
    readiness: readinessFromScore(averageScore),
    weakAreas,
    topics,
    suggestions: recentSuggestions(interviews, 5),
    trend,
    trendDelta,
    lastScore: scores.at(-1) ?? null,
    previousInterviews,
  };
}

/**
 * Aggregate a user's interview history into the numbers the dashboard shows.
 */
export async function getInterviewStats(userId) {
  return aggregateStats(await getUserInterviews(userId));
}
