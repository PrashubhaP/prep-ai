"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { SectionCard } from "@/components/ui/Card";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const date = payload[0].payload?.date;
  return (
    <div className="glass rounded-xl px-4 py-2.5 text-sm border border-glass-border shadow-xl">
      <p className="text-muted text-xs mb-1">
        Session {label}
        {date ? ` · ${date}` : ""}
      </p>
      <p className="font-semibold text-ink">
        Score:{" "}
        <span className="text-gradient">{payload[0].value}%</span>
      </p>
    </div>
  );
}

/**
 * Plain-language read on the trend. `delta` compares the recent sittings with
 * everything earlier, and stays null until there are enough sessions to say.
 */
function TrendSummary({ delta }) {
  if (delta === null) {
    return (
      <p className="text-xs text-muted font-mono mb-3">
        Complete a few more sessions to see which way you&apos;re trending.
      </p>
    );
  }

  if (delta === 0) {
    return (
      <p className="text-xs text-muted font-mono mb-3">
        Holding steady versus your earlier sessions.
      </p>
    );
  }

  const rising = delta > 0;
  return (
    <p
      className={`text-xs font-mono mb-3 ${
        rising ? "text-success" : "text-danger"
      }`}
    >
      {rising ? "▲" : "▼"} {Math.abs(delta)} points{" "}
      {rising ? "up" : "down"} versus your earlier sessions
    </p>
  );
}

export function PerformanceTrend({ data = [], delta = null }) {
  return (
    <SectionCard
      title="Performance Trend"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      }
    >
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-sm text-muted">
          Complete an interview to see your score trend.
        </div>
      ) : (
        <>
        <TrendSummary delta={delta} />
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
          <defs>
            <linearGradient id="scoreGradientFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-blue)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-accent-violet)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="scoreStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-accent-blue)" />
              <stop offset="100%" stopColor="var(--color-accent-violet)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="session"
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="url(#scoreStroke)"
              strokeWidth={2.5}
              fill="url(#scoreGradientFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </>
      )}
    </SectionCard>
  );
}
