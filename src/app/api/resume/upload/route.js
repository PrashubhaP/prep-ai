import User from "@/models/User";
import Resume from "@/models/Resume";
import Interview from "@/models/Interview";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import {
    extractTextFromPDF,
    analyzeResume,
    generateInterviewQuestions,
} from "@/lib/parseResume";

export async function POST(req) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { fileName, role, experienceLevel, fileBase64 } = body;

        if (!fileBase64) {
            return Response.json(
                { success: false, message: "No resume file received" },
                { status: 400 }
            );
        }

        await connectDB();

        // 1. Extract raw text from the uploaded PDF
        const buffer = Buffer.from(fileBase64, "base64");
        const resumeText = await extractTextFromPDF(buffer);

        // 2. Ask AI to extract skills / tech / projects
        const analysis = await analyzeResume(resumeText);
        console.log("===== Resume Analysis =====");
        console.log(JSON.stringify(analysis, null, 2));

        // 3. Save the parsed resume
        const resume = await Resume.create({
            userId,
            fileName,
            role,
            experienceLevel,
            extractedSkills: analysis.skills || [],
            projects: analysis.projects || [],
            technologies: analysis.technologies || [],
        });

        // 4. Generate tailored interview questions
        const questionData = await generateInterviewQuestions({
            skills: analysis.skills || [],
            technologies: analysis.technologies || [],
            projects: analysis.projects || [],
            role,
            experienceLevel,
        });

        // 5. Save the interview with its question set
        const interview = await Interview.create({
            userId,
            resumeId: resume._id,
            role,
            experienceLevel,
            questions: questionData.questions || [],
            status: "pending",
        });

        // 6. Mark onboarding complete
        await User.findOneAndUpdate(
            { clerkId: userId },
            { profileCompleted: true }
        );

        return Response.json({
            success: true,
            resume,
            interview,
        });
    } catch (err) {
        console.error("Resume upload error:", err);
        return Response.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}