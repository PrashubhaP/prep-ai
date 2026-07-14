"use client";

import { useState } from "react";
import { questions } from "@/data/questions";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
    const router = useRouter();

    const role = "Frontend Developer";

    const interviewQuestions = questions[role];

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [answer, setAnswer] = useState("");

    function nextQuestion(answer) {
        const updated = [...answers];
        updated[current] = answer;
        setAnswers(updated);
        setAnswer("");

        if (current < interviewQuestions.length - 1) {
            setCurrent(current + 1);
        } else {
            localStorage.setItem(
                "interviewAnswers",
                JSON.stringify(updated)
            );

            router.push("/feedback");
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-16 px-6">

            <h1 className="text-3xl font-bold mb-8">
                Mock Interview
            </h1>

            <p className="font-semibold mb-6">
                Question {current + 1} / {interviewQuestions.length}
            </p>

            <div className="border rounded-xl p-8">

                <h2 className="text-xl font-semibold mb-6">
                    {interviewQuestions[current]}
                </h2>

                <textarea
                    rows={8}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full border rounded-lg p-4"
                    placeholder="Type your answer here..."
                />

                <button
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
                    onClick={() => nextQuestion(answer)}
                >
                    {current === interviewQuestions.length - 1
                        ? "Submit"
                        : "Next"}
                </button>

            </div>

        </div>
    );
}