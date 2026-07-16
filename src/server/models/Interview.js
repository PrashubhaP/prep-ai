import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    // Overall performance score, 0-100.
    score: { type: Number, default: 0 },
    strengths: [String],
    improvements: [String],
    // Short topic tags the candidate was weak on, e.g. "System Design".
    weakAreas: [String],
    questions: [String],
    answers: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Interview ||
  mongoose.model("Interview", InterviewSchema);
