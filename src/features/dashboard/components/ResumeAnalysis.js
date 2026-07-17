import { SectionCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Map a 0-100 ATS score onto a status label and matching theme colors.
function atsStatus(score) {
  if (score >= 75) {
    return { label: "Good", variant: "success", bar: "bg-success", text: "text-success" };
  }
  if (score >= 50) {
    return { label: "Medium", variant: "warning", bar: "bg-warning", text: "text-warning" };
  }
  return { label: "Low", variant: "danger", bar: "bg-danger", text: "text-danger" };
}

export function ResumeAnalysis({ analysis }) {
  const atsScore = analysis?.atsScore ?? 0;

  // Only meaningful once analyzed; older resumes (or a failed analysis) skip it.
  if (!(atsScore > 0)) return null;

  const status = atsStatus(atsScore);

  return (
    <SectionCard
      title="Resume Analysis"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      }
    >
      <div className="flex items-center gap-5">
        {/* Score */}
        <div className="flex items-baseline gap-1 shrink-0">
          <span className={`text-4xl font-bold ${status.text}`}>{atsScore}</span>
          <span className="text-sm text-muted">/100</span>
        </div>

        {/* Status + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink">ATS Readiness</p>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            How ready your resume is to share with companies.
          </p>
          <div className="h-1.5 w-full rounded-full mt-2.5 overflow-hidden bg-glass border border-glass-border">
            <div
              className={`h-full rounded-full ${status.bar} transition-all duration-700`}
              style={{ width: `${atsScore}%` }}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
