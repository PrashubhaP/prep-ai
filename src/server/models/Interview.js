import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    // Copied from the question pool so a topic means the same thing everywhere.
    topic: { type: String, default: "General" },
  },
  { _id: false }
);

const InterviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    // The saved question/answer pairs, one per question asked.
    responses: [ResponseSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Interview ||
  mongoose.model("Interview", InterviewSchema);
