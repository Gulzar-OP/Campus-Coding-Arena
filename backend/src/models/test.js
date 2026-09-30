import mongoose from "mongoose";

const testProblemSchema =
  new mongoose.Schema(
    {
      problem: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "Problem",
        required: true,
      },

      marks: {
        type: Number,
        default: 10,
        min: 0,
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
        required: [
          true,
          "Test title is required",
        ],
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      createdBy: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "User",
        required: true,
      },

      problems: {
        type: [testProblemSchema],
        default: [],
      },

      duration: {
        type: Number,
        required: [
          true,
          "Duration is required",
        ],
        min: 1,
      },

      startTime: {
        type: Date,
        required: true,
      },

      endTime: {
        type: Date,
        required: true,
      },

      maxAIPrompts: {
        type: Number,
        default: 3,
        min: 0,
        max: 3,
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

      isActive: {
        type: Boolean,
        default: true,
      },

      accessCode: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
      },

      allowDirectAccess: {
        type: Boolean,
        default: false,
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