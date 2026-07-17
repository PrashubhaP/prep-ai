import { auth } from "@clerk/nextjs/server";

import { createResume } from "@/server/services/resume.service";
import { markProfileCompleted } from "@/server/services/user.service";
import {
  extractResumeText,
  generateInterviewQuestions,
  analyzeResume,
} from "@/server/ai/mistral";

// Size of the question bank generated per resume. Each session draws
// QUESTION_COUNT of these, so one upload covers many sittings.
const POOL_SIZE = 50;

// OCR + generating a 50-question bank can take a while; allow a longer window.
export const maxDuration = 300;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fileName, role, experienceLevel, fileData } = await req.json();

    if (!fileData) {
      return Response.json(
        { success: false, message: "No resume file provided." },
        { status: 400 }
      );
    }

    // 1. Read the resume text out of the PDF.
    const resumeText = await extractResumeText(fileData);

    if (!resumeText) {
      return Response.json(
        {
          success: false,
          message: "Could not read any text from the resume PDF.",
        },
        { status: 422 }
      );
    }

    // 2. Generate the question bank and analyze the resume — concurrently, so
    //    the analysis adds little to the overall upload time. The analysis is
    //    best-effort: if it fails, we still save the resume and its questions.
    const [questionPool, analysis] = await Promise.all([
      generateInterviewQuestions({
        resumeText,
        role,
        experienceLevel,
        count: POOL_SIZE,
      }),
      analyzeResume({ resumeText, role, experienceLevel }).catch(() => null),
    ]);

    // 3. Persist the resume together with its analysis and question bank.
    const resume = await createResume(userId, {
      fileName,
      role,
      experienceLevel,
      questionPool,
      analysis,
    });

    await markProfileCompleted(userId);

    return Response.json({ success: true, resume });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
