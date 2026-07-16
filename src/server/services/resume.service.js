import connectDB from "@/server/db";
import Resume from "@/server/models/Resume";

export async function createResume(
  userId,
  { fileName, role, experienceLevel, questions = [] }
) {
  await connectDB();

  return Resume.create({
    userId,
    fileName,
    role,
    experienceLevel,
    questions,
    extractedSkills: [],
    projects: [],
    technologies: [],
  });
}

export async function getLatestResume(userId) {
  await connectDB();
  return Resume.findOne({ userId }).sort({ createdAt: -1 });
}
