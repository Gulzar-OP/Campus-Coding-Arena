import mongoose from "mongoose";

const problemResultSchema =
  new mongoose.Schema(
    {
      problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "not_attempted",
          "attempted",
          "passed",
          "failed",
        ],
        default: "not_attempted",
      },

      submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission",
        default: null,
      },

      marksObtained: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    },
  );

const testAttemptSchema =
  new mongoose.Schema(
    {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true,
      },

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      startedAt: {
        type: Date,
        default: Date.now,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "in_progress",
          "submitted",
          "expired",
        ],
        default: "in_progress",
      },

      aiPromptsUsed: {
        type: Number,
        default: 0,
      },

      problemResults: {
        type: [problemResultSchema],
        default: [],
      },

      totalMarks: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    },
  );

testAttemptSchema.index(
  {
    test: 1,
    student: 1,
  },
  {
    unique: true,
  },
);

const TestAttempt =
  mongoose.model(
    "TestAttempt",
    testAttemptSchema,
  );

export default TestAttempt;