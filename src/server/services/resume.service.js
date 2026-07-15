import connectDB from "@/server/db";
import Resume from "@/server/models/Resume";

export async function createResume(userId, { fileName, role, experienceLevel }) {
  await connectDB();

  return Resume.create({
    userId,
    fileName,
    role,
    experienceLevel,
    extractedSkills: [],
    projects: [],
    technologies: [],
  });
}

export async function getLatestResume(userId) {
  await connectDB();
  return Resume.findOne({ userId }).sort({ createdAt: -1 });
}
