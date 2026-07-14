"use client";

const strengths = [
  "Good communication",
  "Logical thinking",
  "Well-structured answers",
];

const improvements = [
  "Practice SQL joins",
  "Improve React Hooks knowledge",
  "Answer more concisely",
];

export default function FeedbackPage() {
  const score = 82;
  const status = score >= 70 ? "Good performance" : "Needs practice";

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] uppercase text-[var(--color-signal)] mb-3">
        Session complete
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl mb-10 text-[var(--color-ink)]">
        Interview feedback
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="border border-[var(--color-line)] rounded-2xl p-6">
          <h2 className="text-sm text-[var(--color-muted)] mb-2">
            Overall score
          </h2>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--color-signal)]">
            {score}%
          </p>
        </div>

        <div className="border border-[var(--color-line)] rounded-2xl p-6">
          <h2 className="text-sm text-[var(--color-muted)] mb-2">
            Interview status
          </h2>
          <span className="inline-block text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-signal-soft)] text-[var(--color-signal)]">
            {status}
          </span>
        </div>
      </div>

      <div className="border border-[var(--color-line)] rounded-2xl p-6 mb-6">
        <h2 className="font-medium mb-4 text-[var(--color-ink)]">Strengths</h2>
        <ul className="space-y-2.5">
          {strengths.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-[var(--color-ink-soft)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal)] mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-[var(--color-line)] rounded-2xl p-6">
        <h2 className="font-medium mb-4 text-[var(--color-ink)]">Areas to improve</h2>
        <ul className="space-y-2.5">
          {improvements.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-[var(--color-ink-soft)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}