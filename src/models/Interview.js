import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experienceLevel: {
      type: String,
      required: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        answer: {
          type: String,
          default: "",
        },

        score: {
          type: Number,
          default: null,
        },

        feedback: {
          type: String,
          default: "",
        },
      },
    ],

    totalScore: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Interview ||
  mongoose.model("Interview", InterviewSchema);