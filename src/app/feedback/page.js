"use client";

export default function FeedbackPage() {

  const score = 82;

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">

      <h1 className="text-3xl font-bold mb-10">
        Interview Feedback
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold mb-2">Overall Score</h2>
          <p className="text-5xl font-bold text-blue-600">
            {score}%
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold mb-2">
            Interview Status
          </h2>

          <p className="text-green-600 font-bold">
            Good Performance
          </p>
        </div>

      </div>

      <div className="border rounded-xl p-6 mt-8">

        <h2 className="font-semibold mb-3">
          Strengths
        </h2>

        <ul className="list-disc ml-6">
          <li>Good communication</li>
          <li>Logical thinking</li>
          <li>Well-structured answers</li>
        </ul>

      </div>

      <div className="border rounded-xl p-6 mt-8">

        <h2 className="font-semibold mb-3">
          Areas to Improve
        </h2>

        <ul className="list-disc ml-6">
          <li>Practice SQL joins</li>
          <li>Improve React Hooks knowledge</li>
          <li>Answer more concisely</li>
        </ul>

      </div>

    </div>
  );
}