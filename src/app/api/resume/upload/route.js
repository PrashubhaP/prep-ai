import User from "@/models/User";
import Resume from "@/models/Resume";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";

import {
  extractTextFromPDF,
  analyzeResumeAndGenerateQuestions,
} from "@/lib/parseResume";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const {
      fileName,
      role,
      experienceLevel,
      fileBase64,
    } = body;

    if (!fileBase64) {
      return Response.json(
        {
          success: false,
          message: "No resume uploaded",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // Extract Resume Text
    const buffer = Buffer.from(fileBase64, "base64");

    const resumeText = await extractTextFromPDF(buffer);

    // Single Gemini Call
    const result = await analyzeResumeAndGenerateQuestions(
      resumeText,
      role,
      experienceLevel
    );

    // Save Resume
    const resume = await Resume.create({
      userId,
      fileName,
      role,
      experienceLevel,
      extractedSkills: result.skills || [],
      technologies: result.technologies || [],
      projects: result.projects || [],
      questionBank: [],
    });

    // Save Question Bank
    resume.questionBank = (result.questions || []).map((q, index) => ({
      id: index + 1,
      questionText: q.questionText,
      category: q.category,
      used: false,
    }));

    await resume.save();

    await User.findOneAndUpdate(
      {
        clerkId: userId,
      },
      {
        profileCompleted: true,
      }
    );

    return Response.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}