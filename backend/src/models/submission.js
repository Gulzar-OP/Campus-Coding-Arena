import mongoose from "mongoose";

const problemSubmissionSchema =
  new mongoose.Schema(
    {
      problem: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Problem",
        required: true,
      },

      code: {
        type: String,
        required: true,
      },

      language: {
        type: String,
        required: true,
      },

      verdict: {
        type: String,
        default: "Pending",
      },

      passedTestCases: {
        type: Number,
        default: 0,
      },

      totalTestCases: {
        type: Number,
        default: 0,
      },

      executionTime: {
        type: Number,
        default: null,
      },

      memory: {
        type: Number,
        default: null,
      },

      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    },
  );

const submissionSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      test: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Test",
        required: true,
      },

      problems: {
        type: [
          problemSubmissionSchema,
        ],
        default: [],
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
        ],
        default:
          "in_progress",
      },
    },
    {
      timestamps: true,
    },
  );

// Important:
// ek user + ek test ka sirf ek submission document
submissionSchema.index(
  {
    user: 1,
    test: 1,
  },
  {
    unique: true,
  },
);

const Submission =
  mongoose.model(
    "Submission",
    submissionSchema,
  );

export default Submission;