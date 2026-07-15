import { auth } from "@clerk/nextjs/server";

import { createResume } from "@/server/services/resume.service";
import { markProfileCompleted } from "@/server/services/user.service";

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

    const resume = await createResume(userId, {
      fileName: body.fileName,
      role: body.role,
      experienceLevel: body.experienceLevel,
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
