"use client";

import { useState } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const trendData = [
    { session: "1", score: 55 },
    { session: "2", score: 62 },
    { session: "3", score: 58 },
    { session: "4", score: 70 },
    { session: "5", score: 76 },
];

const pastInterviews = [
    { id: 1, role: "Frontend Developer", date: "2026-07-01", score: 76 },
    { id: 2, role: "Backend Developer", date: "2026-06-25", score: 70 },
    { id: 3, role: "Frontend Developer", date: "2026-06-18", score: 58 },
];

export default function DashboardClient({
    user,
    resume,
}) {
    const [file, setFile] = useState(null);
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [message, setMessage] = useState("");
    async function handleUpload() {
        if (!file) {
            alert("Please select a resume.");
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
        localStorage.setItem("selectedRole", role);

        if (data.success) {
            setMessage("✅ Resume uploaded successfully!");
        } else {
            setMessage("❌ Upload failed.");
        }
    }
    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold mb-8">
                Welcome, {user?.firstName || "User"} 👋
            </h1>

            <div className="mt-12 flex justify-center">
                <a
                    href="/interview"
                    className="
            inline-flex items-center gap-3
            bg-gradient-to-r from-emerald-500 to-green-600
            text-white
            px-12 py-5
            rounded-2xl
            shadow-xl
            hover:shadow-emerald-400/40
            hover:scale-105
            transition-all duration-300
            text-2xl font-extrabold tracking-wide
        "
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    🚀 Start Mock Interview
                </a>
            </div>

            <br></br>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className="text-3xl font-bold mt-1">68%</p>
                </div>

                <div className="border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Total Interviews</p>
                    <p className="text-3xl font-bold mt-1">{pastInterviews.length}</p>
                </div>

                <div className="border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Weak Areas</p>
                    <p className="text-lg font-semibold mt-1">
                        System Design, SQL
                    </p>
                </div>

                <div className="border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Readiness</p>
                    <p className="text-3xl font-bold mt-1 text-blue-600">Good</p>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="border rounded-xl p-5 mb-10">
                <h2 className="font-semibold mb-4">Performance Trend</h2>

                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                        <XAxis dataKey="session" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {/* Previous Interviews */}
            <div className="border rounded-xl p-5 mb-10">
                <h2 className="font-semibold mb-4">Previous Interviews</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b">
                            <th className="pb-2">Role</th>
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Score</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pastInterviews.map((i) => (
                            <tr key={i.id} className="border-b last:border-0">
                                <td className="py-2">{i.role}</td>
                                <td className="py-2">{i.date}</td>
                                <td className="py-2">{i.score}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Suggestions */}
            <div className="border rounded-xl p-5 mb-10">
                <h2 className="font-semibold mb-2">Improvement Suggestions</h2>

                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Practice explaining trade-offs in system design questions.</li>
                    <li>Review SQL joins and indexing concepts.</li>
                    <li>Work on giving more concise, structured answers.</li>
                </ul>
            </div>
            <div className="border rounded-xl p-6 mb-8 bg-white shadow-sm">

                <h2 className="text-xl font-semibold mb-6">
                    📄 Resume Information
                </h2>

                <div className="space-y-3">

                    <div>
                        <p className="text-gray-500 text-sm">
                            Resume
                        </p>

                        <p className="font-medium">
                            {resume?.fileName}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">
                            Role
                        </p>

                        <p className="font-medium">
                            {resume?.role}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">
                            Experience
                        </p>

                        <p className="font-medium">
                            {resume?.experienceLevel}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">
                            Uploaded
                        </p>

                        <p className="font-medium">
                            {resume
                                ? new Date(
                                    resume.createdAt
                                ).toLocaleDateString()
                                : ""}
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.href = "/onboarding"}
                        className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-700"
                    >
                        Update Resume
                    </button>

                </div>

            </div>
        </div>
    );
}