import connectDB from "@/server/db";
import Resume from "@/server/models/Resume";

export async function createResume(
  userId,
  { fileName, role, experienceLevel, questionPool = [], analysis = null }
) {
  await connectDB();

  return Resume.create({
    userId,
    fileName,
    role,
    experienceLevel,
    questionPool,
    // Best-effort; omitted when the analysis step didn't produce anything.
    ...(analysis ? { analysis } : {}),
  });
}

export async function getLatestResume(userId) {
  await connectDB();
  return Resume.findOne({ userId }).sort({ createdAt: -1 });
}
