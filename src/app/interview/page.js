"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
    const router = useRouter();

    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("currentInterview"));

        if (!data) {
            router.push("/dashboard");
            return;
        }

        setQuestions(data.questions);
        setLoading(false);
    }, []);

    function nextQuestion() {
        const updatedAnswers = [...answers];
        updatedAnswers[current] = answer;

        setAnswers(updatedAnswers);

        if (current < questions.length - 1) {
            setCurrent(current + 1);
            setAnswer(updatedAnswers[current + 1] || "");
        } else {
            localStorage.setItem(
                "interviewAnswers",
                JSON.stringify(updatedAnswers)
            );

            alert("Interview Completed!");

            router.push("/dashboard");
        }
    }

    function previousQuestion() {
        const updatedAnswers = [...answers];
        updatedAnswers[current] = answer;

        setAnswers(updatedAnswers);

        if (current > 0) {
            setCurrent(current - 1);
            setAnswer(updatedAnswers[current - 1] || "");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl">
                Loading Interview...
            </div>
        );
    }

    const progress = ((current + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto py-16 px-6">

            <h1 className="text-3xl font-bold mb-8">
                Mock Interview
            </h1>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-10">

                <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                        width: `${progress}%`,
                    }}
                />

            </div>

            <div className="border rounded-2xl p-8 shadow">

                <p className="text-sm text-gray-500 mb-2">
                    Question {current + 1} of {questions.length}
                </p>

                <h2 className="text-2xl font-semibold mb-8">
                    {questions[current]?.questionText}
                </h2>

                <textarea
                    rows={8}
                    className="w-full border rounded-lg p-4"
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />

                <div className="flex justify-between mt-8">

                    <button
                        onClick={previousQuestion}
                        disabled={current === 0}
                        className="bg-gray-300 px-6 py-3 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <button
                        onClick={nextQuestion}
                        disabled={!answer.trim()}
                        className="bg-green-600 text-white px-6 py-3 rounded disabled:opacity-50"
                    >
                        {current === questions.length - 1
                            ? "Finish Interview"
                            : "Next Question"}
                    </button>

                </div>

            </div>

        </div>
    );
}