/**
 * Chooses which questions a given session asks.
 *
 * A resume's question bank is generated once (50 or so questions), and each
 * sitting draws only a handful. This module decides which handful: questions
 * the candidate has never seen come first, and within that the selection is
 * spread across topics so a single session doesn't land entirely on one area.
 */

import { questionKey } from "@/server/ai/mistral";

import { getLatestResume } from "./resume.service";
import { getUserInterviews } from "./interview.service";

/** Questions asked per sitting. */
export const QUESTION_COUNT = 5;

/** Read a resume's bank as `{text, topic, difficulty}` objects. */
function poolFor(resume) {
  return (resume?.questionPool ?? []).map((q) => ({
    text: q.text,
    topic: q.topic || "General",
    difficulty: q.difficulty || "medium",
  }));
}

/**
 * Map each previously-asked question to the index of the most recent sitting it
 * appeared in. Questions never asked get -1, so plain ascending order puts
 * unseen questions first and the longest-ago ones next — which is exactly the
 * rotation we want, including after the bank has been exhausted and has to wrap.
 *
 * @param {Array} interviews - Chronologically ordered.
 */
function lastAskedIndex(interviews) {
  const lastAsked = new Map();

  interviews.forEach((interview, index) => {
    for (const response of interview.responses ?? []) {
      lastAsked.set(questionKey(response.question), index);
    }
  });

  return lastAsked;
}

/**
 * Take `limit` questions, round-robining across topics.
 *
 * `sorted` must already be in freshness order; each topic's bucket inherits that
 * order, so this trades a little freshness for topic spread and never picks a
 * stale question from a topic when a fresher one from that same topic exists.
 */
function pickAcrossTopics(sorted, limit) {
  const byTopic = new Map();

  for (const question of sorted) {
    const topic = question.topic || "General";
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic).push(question);
  }

  const picked = [];
  const buckets = [...byTopic.values()];

  while (picked.length < limit) {
    let tookAny = false;

    for (const bucket of buckets) {
      if (picked.length >= limit) break;
      if (bucket.length === 0) continue;
      picked.push(bucket.shift());
      tookAny = true;
    }

    // Every bucket is empty — the bank is smaller than `limit`.
    if (!tookAny) break;
  }

  return picked;
}

/**
 * The selection itself, with no database access — kept separate so the rotation
 * can be exercised directly.
 *
 * @param {Array<{text, topic, difficulty}>} pool
 * @param {Array} interviews - Chronologically ordered.
 * @returns {{questions: Array, poolSize: number, unaskedCount: number}}
 */
export function selectQuestions(pool, interviews, limit = QUESTION_COUNT) {
  const lastAsked = lastAskedIndex(interviews);

  const ranked = pool
    .map((question) => ({
      question,
      seenAt: lastAsked.get(questionKey(question.text)) ?? -1,
    }))
    // Ascending: never-asked (-1) first, then least recently asked.
    .sort((a, b) => a.seenAt - b.seenAt)
    .map((entry) => entry.question);

  const unaskedCount = pool.filter(
    (q) => !lastAsked.has(questionKey(q.text))
  ).length;

  return {
    questions: pickAcrossTopics(ranked, limit),
    poolSize: pool.length,
    unaskedCount,
  };
}

/**
 * Pick the questions for this user's next sitting.
 *
 * @returns {Promise<{role: string, experienceLevel: string, questions: Array<
 *   {text: string, topic: string, difficulty: string}>, poolSize: number,
 *   unaskedCount: number}>}
 */
export async function getNextQuestions(userId, limit = QUESTION_COUNT) {
  const [resume, interviews] = await Promise.all([
    getLatestResume(userId),
    getUserInterviews(userId),
  ]);

  const role = resume?.role || "Frontend Developer";
  const experienceLevel = resume?.experienceLevel || "";

  return {
    role,
    experienceLevel,
    ...selectQuestions(poolFor(resume), interviews, limit),
  };
}
