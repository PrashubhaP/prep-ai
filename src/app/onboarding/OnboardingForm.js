"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [file, setFile] = useState(null);
    const router = useRouter();
    const [message, setMessage] = useState("");

    async function handleContinue() {
        if (!file || !role || !experience) {
            setMessage("Please complete all fields.");
            return;
        }

        const res = await fetch("/api/resume/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: file.name,
                role,
                experienceLevel: experience,
            }),
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("selectedRole", role);
            router.push("/dashboard");
        } else {
            setMessage(data.message || "Upload failed.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-xl">

                <h1 className="text-3xl font-bold mb-2">
                    Complete Your Profile
                </h1>

                <p className="text-gray-500 mb-8">
                    Upload your resume to personalize your interview preparation.
                </p>

                <h2 className="text-2xl font-semibold mb-4">
                    Upload Resume
                </h2>

                <input
                    type="file"
                    accept=".pdf"
                    className="mb-6 w-full"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <select
                    className="border rounded-lg p-3 w-full mb-4"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="">Select Job Role</option>
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>Full Stack Developer</option>
                    <option>Machine Learning Engineer</option>
                    <option>Data Analyst</option>
                </select>

                <select
                    className="border rounded-lg p-3 w-full mb-6"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                >
                    <option value="">Experience Level</option>
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                </select>

                <button
                    onClick={handleContinue}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Continue
                </button>

                {message && (
                    <p className="text-red-500 mt-4 text-center">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}