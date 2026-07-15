import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    role: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    extractedSkills: [String],
    projects: [String],
    technologies: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
