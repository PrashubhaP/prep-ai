import { SectionCard } from "@/components/ui/Card";

export function Suggestions({ suggestions = [] }) {
  return (
    <SectionCard
      title="Improvement Suggestions"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      }
    >
      {suggestions.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          Complete an interview to get personalized improvement tips.
        </p>
      ) : (
      <div className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <div
            key={suggestion}
            className="flex items-start gap-4 p-3.5 rounded-xl bg-canvas-raised border border-glass-border"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-accent-blue/20 to-accent-violet/20 text-xs font-bold text-gradient font-mono">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-ink-soft leading-relaxed pt-0.5">
              {suggestion}
            </p>
          </div>
        ))}
      </div>
      )}
    </SectionCard>
  );
}
