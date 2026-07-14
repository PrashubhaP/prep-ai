import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";

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

        await connectDB();

        const resume = await Resume.create({
            userId,
            fileName: body.fileName,
            role: body.role,
            experienceLevel: body.experienceLevel,
            extractedSkills: [],
            projects: [],
            technologies: [],
        });
        await User.findOneAndUpdate(
            { clerkId: userId },
            {
                profileCompleted: true,
            }
        );

        return Response.json({
            success: true,
            resume,
        });

    } catch (err) {
        return Response.json(
            {
                success: false,
                message: err.message,
            },
            { status: 500 }
        );
    }
}