import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    // Copied from the question pool rather than re-derived by the grader, so a
    // topic means the same thing in every session.
    topic: { type: String, default: "General" },
    // How this individual answer scored, 0-100.
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

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
    // Flat mirrors of `responses`, kept for interviews recorded before
    // per-question grading existed.
    questions: [String],
    answers: [String],
    // Per-question grading. This is what makes topic-level analysis possible.
    responses: [ResponseSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Interview ||
  mongoose.model("Interview", InterviewSchema);
