import mongoose from "mongoose";

const testProblemSchema =
  new mongoose.Schema(
    {
      problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
      },
    },
    {
      _id: false,
    },
  );

const testSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      problems: {
        type: [testProblemSchema],
        default: [],
      },

      duration: {
        type: Number,
        required: true,
        default: 60,
      },

      startTime: {
        type: Date,
        required: true,
      },

      endTime: {
        type: Date,
        required: true,
      },

      accessCode: {
        type: String,
        trim: true,
        uppercase: true,
      },

      allowDirectAccess: {
        type: Boolean,
        default: false,
      },

      maxAIPrompts: {
        type: Number,
        default: 3,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "published",
          "completed",
        ],
        default: "draft",
      },
    },
    {
      timestamps: true,
    },
  );

const Test = mongoose.model(
  "Test",
  testSchema,
);

export default Test;