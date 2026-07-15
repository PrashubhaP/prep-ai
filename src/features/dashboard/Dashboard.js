import { StatCard } from "@/components/ui/StatCard";
import { ButtonLink } from "@/components/ui/Button";

import { pastInterviews } from "./data";
import { PerformanceTrend } from "./components/PerformanceTrend";
import { PreviousInterviews } from "./components/PreviousInterviews";
import { Suggestions } from "./components/Suggestions";
import { ResumeSummary } from "./components/ResumeSummary";

export function Dashboard({ user, resume }) {
  const stats = [
    { label: "Average Score", value: "68%" },
    { label: "Total Interviews", value: pastInterviews.length },
    { label: "Weak Areas", value: "System Design, SQL" },
    { label: "Readiness", value: "Good", accent: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in-up">
        <div>
          <p className="text-sm text-muted mb-1 font-mono tracking-wider uppercase">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back,{" "}
            <span className="text-gradient">
              {user?.firstName || "User"}
            </span>{" "}
            👋
          </h1>
          <p className="text-muted mt-2">
            Here&apos;s an overview of your interview preparation progress.
          </p>
        </div>
        <ButtonLink href="/interview" size="lg">
          🚀 Start Mock Interview
        </ButtonLink>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up delay-300">
          <PerformanceTrend />
        </div>
        <div className="animate-fade-in-up delay-400">
          <PreviousInterviews />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up delay-500">
          <Suggestions />
        </div>
        <div className="animate-fade-in-up delay-600">
          <ResumeSummary resume={resume} />
        </div>
      </div>
    </div>
  );
}
