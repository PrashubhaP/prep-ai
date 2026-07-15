import { SectionCard } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

function Detail({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-canvas-raised border border-glass-border">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-glass text-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-ink truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export function ResumeSummary({ resume }) {
  const uploaded = resume
    ? new Date(resume.createdAt).toLocaleDateString()
    : "";

  return (
    <SectionCard
      title="Resume Information"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Detail
          label="Resume"
          value={resume?.fileName}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <Detail
          label="Role"
          value={resume?.role}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
        <Detail
          label="Experience"
          value={resume?.experienceLevel}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
        />
        <Detail
          label="Uploaded"
          value={uploaded}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      <ButtonLink href="/onboarding" variant="ghost" className="w-full sm:w-auto">
        Update Resume
      </ButtonLink>
    </SectionCard>
  );
}
