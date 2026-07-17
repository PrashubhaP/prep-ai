import { StatCard } from "@/components/ui/StatCard";
import { ButtonLink } from "@/components/ui/Button";

import { PerformanceTrend } from "./components/PerformanceTrend";
import { PreviousInterviews } from "./components/PreviousInterviews";
import { Suggestions } from "./components/Suggestions";
import { ResumeSummary } from "./components/ResumeSummary";
import { TopicBreakdown } from "./components/TopicBreakdown";

export function Dashboard({ user, resume, stats }) {
  const {
    total = 0,
    averageScore = null,
    readiness = "—",
    weakAreas = [],
    topics = [],
    suggestions = [],
    trend = [],
    trendDelta = null,
    previousInterviews = [],
  } = stats ?? {};

  const statCards = [
    {
      label: "Average Score",
      value: averageScore === null ? "—" : `${averageScore}%`,
    },
    { label: "Total Interviews", value: total },
    {
      label: "Weakest Area",
      // Long topic lists overflow the tile, so lead with the weakest and count
      // the rest.
      value:
        weakAreas.length === 0
          ? "—"
          : weakAreas.length === 1
          ? weakAreas[0]
          : `${weakAreas[0]} +${weakAreas.length - 1}`,
    },
    { label: "Readiness", value: readiness, accent: true },
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
        {statCards.map((stat, i) => (
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
          <PerformanceTrend data={trend} delta={trendDelta} />
        </div>
        <div className="animate-fade-in-up delay-400">
          <TopicBreakdown topics={topics} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up delay-500">
          <Suggestions suggestions={suggestions} />
        </div>
        <div className="animate-fade-in-up delay-600">
          <PreviousInterviews interviews={previousInterviews} />
        </div>
      </div>

      <div className="animate-fade-in-up delay-600">
        <ResumeSummary resume={resume} />
      </div>
    </div>
  );
}
