import { SectionCard } from "@/components/ui/Card";

function toneFor(score) {
  if (score >= 75) return { bar: "bg-success", text: "text-success" };
  if (score >= 60) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-danger", text: "text-danger" };
}

/** Movement since before the recent sittings. Null until there's a comparison. */
function Delta({ value }) {
  if (value === null || value === 0) return null;

  const rising = value > 0;
  return (
    <span
      className={`text-xs font-mono ${
        rising ? "text-success" : "text-danger"
      }`}
      title={`${rising ? "Up" : "Down"} ${Math.abs(value)} points versus your earlier sessions`}
    >
      {rising ? "▲" : "▼"} {Math.abs(value)}
    </span>
  );
}

export function TopicBreakdown({ topics = [] }) {
  return (
    <SectionCard
      title="Performance by Topic"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      }
    >
      {topics.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          Complete an interview to see how you score in each topic.
        </p>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => {
            const tone = toneFor(topic.average);
            return (
              <div key={topic.topic}>
                <div className="flex items-baseline justify-between mb-1.5 gap-3">
                  <span className="text-sm text-ink-soft truncate">
                    {topic.topic}
                  </span>
                  <div className="flex items-baseline gap-2 shrink-0">
                    <Delta value={topic.delta} />
                    <span className={`text-sm font-semibold font-mono ${tone.text}`}>
                      {topic.average}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-canvas-raised border border-glass-border">
                  <div
                    className={`h-full rounded-full ${tone.bar} transition-all duration-700 ease-out`}
                    style={{ width: `${topic.average}%` }}
                  />
                </div>
                <p className="text-xs text-muted font-mono mt-1">
                  {topic.answered}{" "}
                  {topic.answered === 1 ? "answer" : "answers"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
