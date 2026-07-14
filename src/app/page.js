import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Ace Your Next Interview with <span className="text-blue-600">PrepAI</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        An AI-powered mock interview platform that generates personalized questions from your resume and gives you detailed feedback to improve your performance.
      </p>
      <div className="flex gap-4">
        <Show when="signed-out">
          <SignUpButton>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              Get Started
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Go to Dashboard
          </Link>
        </Show>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
        <div className="p-6 border rounded-xl">
          <h3 className="font-semibold mb-2">Resume-Based Questions</h3>
          <p className="text-sm text-gray-600">
            Get interview questions tailored to your skills, projects, and experience level.
          </p>
        </div>
        <div className="p-6 border rounded-xl">
          <h3 className="font-semibold mb-2">Instant Feedback</h3>
          <p className="text-sm text-gray-600">
            Receive detailed scoring and improvement suggestions after every session.
          </p>
        </div>
        <div className="p-6 border rounded-xl">
          <h3 className="font-semibold mb-2">Track Your Progress</h3>
          <p className="text-sm text-gray-600">
            Monitor your performance trends across multiple interview sessions.
          </p>
        </div>
      </div>
    </div>
  );
}