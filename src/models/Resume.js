import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        fileName: { type: String, required: true },
        extractedSkills: [String],
        projects: [String],
        technologies: [String],
        role: String,
        experienceLevel: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);

