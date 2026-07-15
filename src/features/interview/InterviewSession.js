"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { questions } from "@/data/questions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const DEFAULT_ROLE = "Frontend Developer";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function InterviewSession({ role = DEFAULT_ROLE }) {
  const router = useRouter();
  const interviewQuestions = questions[role] ?? [];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");

  const isLast = current === interviewQuestions.length - 1;
  const progress = ((current + 1) / interviewQuestions.length) * 100;
  const questionNumber = String(current + 1).padStart(2, "0");
  const words = countWords(answer);

  function goToNext() {
    const updated = [...answers];
    updated[current] = answer;
    setAnswers(updated);
    setAnswer("");

    if (isLast) {
      localStorage.setItem("interviewAnswers", JSON.stringify(updated));
      router.push("/feedback");
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

        {/* Progress rail */}
        <div className="h-1.5 w-full rounded-full mb-10 overflow-hidden bg-glass border border-glass-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue via-accent-violet to-accent-cyan transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glow effect */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent-cyan blur-md" />
          </div>
        </div>

        <Card className="p-8 relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />

          {/* Question */}
          <div className="flex items-baseline gap-4 mb-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-violet/20 font-mono text-sm font-bold text-gradient">
              {questionNumber}
            </span>
            <h2 className="text-xl font-medium leading-snug text-ink">
              {interviewQuestions[current]}
            </h2>
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
            <Button onClick={goToNext} disabled={!answer.trim()}>
              {isLast ? "Submit interview" : "Next question →"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
