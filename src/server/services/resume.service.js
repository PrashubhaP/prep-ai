import connectDB from "@/server/db";
import Resume from "@/server/models/Resume";

export async function createResume(
  userId,
  { fileName, role, experienceLevel, questionPool = [] }
) {
  await connectDB();

  return Resume.create({
    userId,
    fileName,
    role,
    experienceLevel,
    questionPool,
    // Mirrored so anything still reading the flat list keeps working.
    questions: questionPool.map((q) => q.text),
    extractedSkills: [],
    projects: [],
    technologies: [],
  });
}

export async function getLatestResume(userId) {
  await connectDB();
  return Resume.findOne({ userId }).sort({ createdAt: -1 });
}
