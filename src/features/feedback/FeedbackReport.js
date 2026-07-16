import { PageHeader } from "@/components/ui/PageHeader";
import { Card, SectionCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120" className="score-ring">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-blue)" />
            <stop offset="50%" stopColor="var(--color-accent-violet)" />
            <stop offset="100%" stopColor="var(--color-accent-cyan)" />
          </linearGradient>
        </defs>
        <circle className="score-ring-track" cx="60" cy="60" r="45" />
        <circle
          className="score-ring-fill"
          cx="60"
          cy="60"
          r="45"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gradient">{score}%</span>
        <span className="text-xs text-muted mt-0.5">Overall</span>
      </div>
    </div>
  );
}

function FeedbackList({ items, variant, icon }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item}
          className={`flex items-start gap-3 p-3.5 rounded-xl bg-canvas-raised border border-glass-border animate-fade-in-up delay-${(i + 1) * 100}`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs ${
              variant === "success"
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning"
            }`}
          >
            {icon}
          </span>
          <span className="text-sm text-ink-soft leading-relaxed pt-0.5">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function FeedbackReport({ result }) {
  if (!result) {
    return (
      <div className="relative max-w-4xl mx-auto py-16 px-6">
        <div className="orb orb-blue w-[400px] h-[400px] -top-20 -left-40 animate-float" />
        <div className="relative z-10">
          <PageHeader
            eyebrow="Interview feedback"
            title="No feedback yet"
            description="Complete a mock interview to see your AI-scored feedback here."
            className="mb-8"
          />
          <ButtonLink href="/interview" variant="signal" size="lg">
            Start an interview
          </ButtonLink>
        </div>
      </div>
    );
  }

  const { score = 0, strengths = [], improvements = [] } = result;
  const isGood = score >= 70;

  return (
    <div className="relative max-w-4xl mx-auto py-16 px-6">
      {/* Background orbs */}
      <div className="orb orb-blue w-[400px] h-[400px] -top-20 -left-40 animate-float" />
      <div className="orb orb-violet w-[300px] h-[300px] top-40 -right-20 animate-float delay-300" />

      <div className="relative z-10">
        <PageHeader
          eyebrow="Session complete"
          title="Interview feedback"
          className="mb-10"
        />

        {/* Score + Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />
            <h2 className="text-sm text-muted mb-4">Overall Score</h2>
            <ScoreRing score={score} />
          </Card>

          <Card className="flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />
            <h2 className="text-sm text-muted mb-4">Interview Status</h2>
            <Badge variant={isGood ? "success" : "warning"}>
              {isGood ? "✓ Good Performance" : "⚠ Needs Practice"}
            </Badge>
            <p className="text-sm text-muted mt-4 text-center max-w-xs">
              {isGood
                ? "Great job! Keep practicing to maintain your edge."
                : "Don't worry — consistent practice makes perfect."}
            </p>
          </Card>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SectionCard
            title="Strengths"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          >
            <FeedbackList
              items={strengths}
              variant="success"
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
          </SectionCard>

          <SectionCard
            title="Areas to Improve"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            }
          >
            <FeedbackList
              items={improvements}
              variant="warning"
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              }
            />
          </SectionCard>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <ButtonLink href="/interview" size="lg">
            Try Again
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="ghost" size="lg">
            Back to Dashboard
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
