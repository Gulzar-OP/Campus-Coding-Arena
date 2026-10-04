import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },

    expectedOutput: {
      type: String,
      required: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    solved: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    languages: {
      type: [String],
      default: ["C++", "Java", "Python"],
    },

    inputFormat: {
      type: String,
      default: "",
    },

    outputFormat: {
      type: String,
      default: "",
    },

    constraints: {
      type: [String],
      default: [],
    },

    testCases: {
      type: [testCaseSchema],
      default: [],
    },

    timeLimit: {
      type: Number,
      default: 2,
    },

    memoryLimit: {
      type: Number,
      default: 256,
    },

    companies: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    timeComplexity: {
      type: String,
      default: "",
      trim: true,
    },

    spaceComplexity: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Problem = mongoose.model(
  "Problem",
  problemSchema,
);

export default Problem;