export function Card({ className = "", ...props }) {
  return (
    <div
      className={`glass glass-hover rounded-2xl p-6 ${className}`.trim()}
      {...props}
    />
  );
}

/**
 * A card with a standard section heading and optional gradient accent line.
 */
export function SectionCard({ title, icon, children, className = "" }) {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />
      {title ? (
        <div className="flex items-center gap-2.5 mb-5">
          {icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-soft text-signal text-sm">
              {icon}
            </span>
          ) : null}
          <h2 className="font-semibold text-ink">{title}</h2>
        </div>
      ) : null}
      {children}
    </Card>
  );
}
