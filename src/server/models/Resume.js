import mongoose from "mongoose";

const PooledQuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    // Concise topic label, e.g. "System Design". Sessions are balanced across
    // topics and the dashboard aggregates scores by this field, so the labels
    // must stay stable across a resume's whole pool.
    topic: { type: String, default: "General" },
    difficulty: { type: String, default: "medium" },
  },
  { _id: false }
);

// AI analysis of the resume, shown on the dashboard. Produced once at upload
// time; absent on resumes uploaded before the analysis existed.
const AnalysisSchema = new mongoose.Schema(
  {
    // 0-100 estimate of how ready the resume is to share with companies.
    atsScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    role: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    // AI analysis of the resume, surfaced on the dashboard.
    analysis: AnalysisSchema,
    // The full bank of generated questions. Each session draws a few of these;
    // the pool is generated once at upload time.
    questionPool: [PooledQuestionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
