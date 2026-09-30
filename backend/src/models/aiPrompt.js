import mongoose from "mongoose";

const aiPromptSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestAttempt",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      default: "",
    },

    response: {
      type: String,
      required: true,
    },

    promptNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
  },
  {
    timestamps: true,
  },
);

const AIPrompt = mongoose.model(
  "AIPrompt",
  aiPromptSchema,
);

export default AIPrompt;