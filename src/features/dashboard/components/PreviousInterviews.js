import { SectionCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function scoreVariant(score) {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export function PreviousInterviews({ interviews = [] }) {
  return (
    <SectionCard
      title="Previous Interviews"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      }
    >
      {interviews.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          No interviews yet. Your completed sessions will appear here.
        </p>
      ) : (
      <div className="space-y-3">
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-canvas-raised border border-glass-border hover:bg-glass-hover hover:border-glass-border-hover transition-all duration-300 cursor-default"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {interview.role}
              </p>
              <p className="text-xs text-muted mt-0.5">{interview.date}</p>
            </div>
            <Badge variant={scoreVariant(interview.score)}>
              {interview.score}%
            </Badge>
          </div>
        ))}
      </div>
      )}
    </SectionCard>
  );
}
