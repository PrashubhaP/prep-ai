import { Card } from "./Card";

export function StatCard({ label, value, accent = false, className = "" }) {
  return (
    <Card className={`relative overflow-hidden p-5 group ${className}`.trim()}>
      {/* Top accent stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          accent
            ? "bg-gradient-to-r from-accent-blue via-accent-violet to-accent-cyan"
            : "bg-gradient-to-r from-glass-border-hover to-transparent"
        }`}
      />
      <p className="text-sm text-muted mb-1">{label}</p>
      <p
        className={`mt-1 font-bold text-2xl md:text-3xl ${
          accent ? "text-gradient" : "text-ink"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
