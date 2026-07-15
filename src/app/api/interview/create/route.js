import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import Interview from "@/models/Interview";

import { generateInterviewQuestions } from "@/lib/parseResume";

export async function POST() {
    try {
        await connectDB();

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get the latest uploaded resume
        const resume = await Resume.findOne({ userId }).sort({
            createdAt: -1,
        });

        if (!resume) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Resume not found",
                },
                { status: 404 }
            );
        }
        const previousInterviews = await Interview.find({
            userId,
            status: "completed",
        });

        const previousQuestions = previousInterviews.flatMap(interview =>
            interview.questions.map(q => q.question)
        );
        // Generate AI questions
        const result = await generateInterviewQuestions({
            resume,
            previousQuestions,
        });

        // Save interview
        const interview = await Interview.create({
            userId,

            resumeId: resume._id,

            role: resume.role,

            experienceLevel: resume.experienceLevel,

            questions: result.questions.map((q) => ({
                question: q.questionText,
            })),
        });

        return NextResponse.json({
            success: true,
            interviewId: interview._id,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}