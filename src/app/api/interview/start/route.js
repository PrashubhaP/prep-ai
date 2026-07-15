import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import Interview from "@/models/Interview";

export async function POST() {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 }
      );
    }

    const unusedQuestions = resume.questionBank.filter(
      (q) => !q.used
    );

    if (unusedQuestions.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message: "No more interview questions available.",
        },
        { status: 400 }
      );
    }

    const selectedQuestions = unusedQuestions.slice(0, 5);

    const interview = await Interview.create({
      userId,
      resumeId: resume._id,
      questions: selectedQuestions,
      status: "in_progress",
    });

    return NextResponse.json({
      success: true,
      interviewId: interview._id,
      questions: selectedQuestions,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to start interview.",
      },
      { status: 500 }
    );
  }
}