import { StatCard } from "@/components/ui/StatCard";
import { ButtonLink } from "@/components/ui/Button";

import { PreviousInterviews } from "./components/PreviousInterviews";
import { ResumeAnalysis } from "./components/ResumeAnalysis";
import { ResumeSummary } from "./components/ResumeSummary";

export function Dashboard({ user, resume, stats }) {
  const { total = 0, previousInterviews = [] } = stats ?? {};

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
            Practice with questions generated from your resume.
          </p>
        </div>
        <ButtonLink href="/interview" size="lg">
          🚀 Start Mock Interview
        </ButtonLink>
      </div>

      {/* Stat card + Resume Analysis, side by side and matched in height */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="animate-fade-in-up delay-100">
          <StatCard
            label="Total Interviews"
            value={total}
            className="h-full flex flex-col justify-center"
          />
        </div>
        <div className="lg:col-span-3 animate-fade-in-up delay-200">
          <ResumeAnalysis analysis={resume?.analysis} />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up delay-300">
          <PreviousInterviews interviews={previousInterviews} />
        </div>
        <div className="animate-fade-in-up delay-400">
          <ResumeSummary resume={resume} />
        </div>
      </div>
    </div>
  );
}
