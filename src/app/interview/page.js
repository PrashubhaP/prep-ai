"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
  const router = useRouter();

  const role = "Frontend Developer";

  const interviewQuestions = [
    "Loading interview questions..."
  ];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");

  function nextQuestion(answer) {
    const updated = [...answers];
    updated[current] = answer;
    setAnswers(updated);
    setAnswer("");

    if (current < interviewQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem("interviewAnswers", JSON.stringify(updated));

      router.push("/feedback");
    }
  }

  const progress = ((current + 1) / interviewQuestions.length) * 100;
  const questionNumber = String(current + 1).padStart(2, "0");
  const isLast = current === interviewQuestions.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] uppercase text-[var(--color-signal)] mb-3">
        {role} — mock interview
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl mb-6">
        Question {current + 1} of {interviewQuestions.length}
      </h1>

      {/* progress rail */}
      <div className="h-1 w-full bg-line rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-[var(--color-signal)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="border border-line rounded-2xl bg-[var(--color-paper-raised)] p-8">
        <div className="flex items-baseline gap-3 mb-6">
          <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-muted)]">
            Q{questionNumber}
          </span>
          <h2 className="text-xl font-medium leading-snug">
            {interviewQuestions[current]}
          </h2>
        </div>

        <textarea
          rows={8}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border border-line rounded-lg p-4 text-sm leading-relaxed focus:border-[var(--color-signal)] outline-none"
          placeholder="Type your answer here..."
        />

        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-[var(--color-muted)]">
            {answer.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            className="bg-ink text-paper px-6 py-3 rounded-full font-medium hover:bg-[var(--color-signal)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => nextQuestion(answer)}
            disabled={!answer.trim()}
          >
            {isLast ? "Submit interview" : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}