"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Convert uploaded file to Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file."));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleContinue() {
    if (!file || !role || !experience) {
      setMessage("Please complete all fields.");
      return;
    }

    setIsLoading(true);
    setMessage("Analyzing your resume, this can take a few seconds...");

    try {
      const fileBase64 = await fileToBase64(file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          role,
          experienceLevel: experience,
          fileBase64,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("selectedRole", role);
        router.push("/dashboard");
      } else {
        setMessage(data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while processing your resume.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-xl">
        <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] uppercase text-[var(--color-signal)] mb-3">
          Step 01 of 01
        </p>

        <h1 className="font-[family-name:var(--font-display)] text-3xl mb-2">
          Complete your profile
        </h1>

        <p className="text-[var(--color-ink-soft)] mb-8">
          Upload your resume so PrepAI can build interview questions from your
          actual experience.
        </p>

        <div className="border border-line rounded-2xl bg-[var(--color-paper-raised)] p-8">
          {/* Resume Upload */}
          <label className="block text-sm font-medium mb-2">
            Resume
          </label>

          <label className="flex items-center justify-between gap-3 border border-dashed border-line rounded-lg px-4 py-3 mb-6 cursor-pointer hover:border-ink transition-colors">
            <span className="text-sm text-[var(--color-muted)] truncate">
              {file ? file.name : "Choose a PDF file"}
            </span>

            <span className="font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-full border border-line shrink-0">
              Browse
            </span>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {/* Target Role */}
          <label className="block text-sm font-medium mb-2">
            Target role
          </label>

          <select
            className="border border-line rounded-lg p-3 w-full mb-6 bg-transparent text-sm focus:border-[var(--color-signal)] outline-none"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select job role</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>Machine Learning Engineer</option>
            <option>Data Analyst</option>
          </select>

          {/* Experience Level */}
          <label className="block text-sm font-medium mb-2">
            Experience level
          </label>

          <select
            className="border border-line rounded-lg p-3 w-full mb-8 bg-transparent text-sm focus:border-[var(--color-signal)] outline-none"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">Select experience level</option>
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
          </select>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full bg-ink text-paper py-3 rounded-full font-medium hover:bg-[var(--color-signal)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzing..." : "Continue to Dashboard"}
          </button>

          {/* Status Message */}
          {message && (
            <p className="text-[var(--color-amber)] mt-4 text-center text-sm">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}