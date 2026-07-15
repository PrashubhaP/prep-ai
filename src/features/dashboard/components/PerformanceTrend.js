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
import { trendData } from "../data";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-2.5 text-sm border border-glass-border shadow-xl">
      <p className="text-muted text-xs mb-1">Session {label}</p>
      <p className="font-semibold text-ink">
        Score:{" "}
        <span className="text-gradient">{payload[0].value}%</span>
      </p>
    </div>
  );
}

export function PerformanceTrend() {
  return (
    <SectionCard
      title="Performance Trend"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      }
    >
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={trendData}>
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
    </SectionCard>
  );
}
