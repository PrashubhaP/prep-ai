"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { uploadResume } from "@/lib/api";
import { ROLES, EXPERIENCE_LEVELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Label, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function OnboardingForm() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!file || !role || !experience) {
      setMessage("Please complete all fields.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const data = await uploadResume({
        file,
        role,
        experienceLevel: experience,
      });

      if (data.success) {
        localStorage.setItem("selectedRole", role);
        router.push("/dashboard");
      } else {
        setMessage(data.message || "Upload failed.");
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16">
      {/* Background orbs */}
      <div className="orb orb-blue w-[400px] h-[400px] -top-20 -right-20 animate-float" />
      <div className="orb orb-violet w-[300px] h-[300px] bottom-20 -left-20 animate-float delay-300" />

      <div className="w-full max-w-xl relative z-10">
        <PageHeader
          eyebrow="Step 01 of 01"
          title="Complete your profile"
          description="Upload your resume so PrepAI can build interview questions from your actual experience."
          className="mb-8"
        />

        <Card className="p-8 relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />

          {/* File upload */}
          <Label>Resume</Label>
          <label
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl px-6 py-8 mb-6 cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-accent-blue bg-signal-soft"
                : file
                ? "border-success/40 bg-success-soft"
                : "border-glass-border hover:border-accent-blue/50 hover:bg-glass-hover"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Upload icon */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                file
                  ? "bg-success-soft text-success"
                  : "bg-glass text-muted"
              }`}
            >
              {file ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </div>

            {file ? (
              <div className="text-center">
                <p className="text-sm font-medium text-success">{file.name}</p>
                <p className="text-xs text-muted mt-1">Click to change file</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-ink-soft">
                  Drop your PDF here, or{" "}
                  <span className="text-accent-blue">browse</span>
                </p>
                <p className="text-xs text-muted mt-1">PDF files only</p>
              </div>
            )}

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <SelectField
            label="Target role"
            placeholder="Select job role"
            options={ROLES}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mb-6"
          />

          <SelectField
            label="Experience level"
            placeholder="Select experience level"
            options={EXPERIENCE_LEVELS}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="mb-8"
          />

          <Button
            onClick={handleContinue}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Analyzing your resume…" : "Continue to dashboard"}
          </Button>

          {loading ? (
            <p className="text-xs text-muted mt-3 text-center">
              Reading your resume, analyzing it and generating personalized
              questions. This can take up to a minute.
            </p>
          ) : null}

          {message ? (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-warning-soft text-warning text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {message}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
