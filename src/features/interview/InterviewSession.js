"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { submitInterview } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";

const DEFAULT_ROLE = "Frontend Developer";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function InterviewSession({
  role = DEFAULT_ROLE,
  experienceLevel = "",
  questions = [],
  poolSize = 0,
  unaskedCount = 0,
}) {
  const router = useRouter();
  const interviewQuestions = questions;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLast = current === interviewQuestions.length - 1;
  const progress = ((current + 1) / interviewQuestions.length) * 100;
  const questionNumber = String(current + 1).padStart(2, "0");
  const words = countWords(answer);
  const question = interviewQuestions[current];

  if (interviewQuestions.length === 0) {
    return (
      <div className="relative max-w-3xl mx-auto py-16 px-6">
        <div className="orb orb-blue w-[300px] h-[300px] -top-10 -right-32 animate-float" />
        <div className="relative z-10">
          <PageHeader
            eyebrow="Mock interview"
            title="No questions yet"
            description="Upload your resume so PrepAI can generate interview questions tailored to your experience."
            className="mb-8"
          />
          <ButtonLink href="/onboarding" variant="signal" size="lg">
            Upload your resume
          </ButtonLink>
        </div>
      </div>
    );
  }

  async function submit(finalAnswers) {
    setSubmitting(true);
    setError("");
    try {
      const data = await submitInterview({
        role,
        experienceLevel,
        questions: interviewQuestions,
        answers: finalAnswers,
      });

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Could not save the interview.");
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function goToNext() {
    const updated = [...answers];
    updated[current] = answer;
    setAnswers(updated);
    setAnswer("");

    if (isLast) {
      submit(updated);
    } else {
      setCurrent(current + 1);
    }
  }

  return (
    <div className="relative max-w-3xl mx-auto py-16 px-6">
      {/* Background orbs */}
      <div className="orb orb-blue w-[300px] h-[300px] -top-10 -right-32 animate-float" />
      <div className="orb orb-violet w-[250px] h-[250px] bottom-20 -left-28 animate-float delay-300" />

      <div className="relative z-10">
        <PageHeader
          eyebrow={`${role} — mock interview`}
          title={`Question ${current + 1} of ${interviewQuestions.length}`}
          className="mb-6"
        />

        {/* Pool context — makes it clear these 5 are drawn from a larger bank. */}
        {poolSize > interviewQuestions.length ? (
          <p className="text-xs text-muted font-mono mb-3">
            Drawn from your {poolSize}-question bank ·{" "}
            {unaskedCount > 0
              ? `${unaskedCount} you haven't seen yet`
              : "you've seen them all — revisiting the oldest first"}
          </p>
        ) : null}

        {/* Progress rail */}
        <div className="h-1.5 w-full rounded-full mb-10 overflow-hidden bg-glass border border-glass-border">
          <div
            className="h-full rounded-full bg-linear-to-r from-accent-blue via-accent-violet to-accent-cyan transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glow effect */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent-cyan blur-md" />
          </div>
        </div>

        <Card className="p-8 relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />

          {/* Question */}
          <div className="flex items-baseline gap-4 mb-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-violet/20 font-mono text-sm font-bold text-gradient">
              {questionNumber}
            </span>
            <div>
              <h2 className="text-xl font-medium leading-snug text-ink">
                {question.text}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {question.topic}
                </span>
                <span className="h-1 w-1 rounded-full bg-glass-border-hover" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {question.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Answer textarea */}
          <textarea
            rows={8}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border border-glass-border rounded-xl p-5 text-sm leading-relaxed bg-glass backdrop-blur-sm text-ink placeholder:text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 outline-none transition-all duration-300 resize-none"
            placeholder="Type your answer here..."
          />

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-mono">
                {words} {words === 1 ? "word" : "words"}
              </span>
              {words > 0 && (
                <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
              )}
            </div>
            <Button onClick={goToNext} disabled={!answer.trim() || submitting}>
              {submitting
                ? "Saving your answers…"
                : isLast
                ? "Submit interview"
                : "Next question →"}
            </Button>
          </div>

          {error ? (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-warning-soft text-warning text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
