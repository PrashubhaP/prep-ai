"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Your Dashboard</h1>

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
          <p className="text-lg font-semibold mt-1">System Design, SQL</p>
        </div>
        <div className="border rounded-xl p-5">
          <p className="text-sm text-gray-500">Readiness</p>
          <p className="text-3xl font-bold mt-1 text-blue-600">Good</p>
        </div>
      </div>

      <div className="border rounded-xl p-5 mb-10">
        <h2 className="font-semibold mb-4">Performance Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <XAxis dataKey="session" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

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

      <div className="border rounded-xl p-5">
        <h2 className="font-semibold mb-2">Improvement Suggestions</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Practice explaining trade-offs in system design questions.</li>
          <li>Review SQL joins and indexing concepts.</li>
          <li>Work on giving more concise, structured answers.</li>
        </ul>
      </div>
    </div>
  );
}