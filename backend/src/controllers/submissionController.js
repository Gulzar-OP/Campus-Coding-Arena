import Submission from "../models/submission.js";
import Problem from "../models/Problem.js";
import User from '../models/user.js'

import {
  executeCode,
} from "../services/judge0Service.js";


// ==============================
// SUBMIT CODE
// ==============================

export const submitCode = async (req, res) => {
  try {
    const {
      problemId,
      code,
      language,
    } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message:
          "Problem, code and language are required",
      });
    }

    const problem =
      await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    if (!problem.testCases?.length) {
      return res.status(400).json({
        success: false,
        message:
          "No test cases available",
      });
    }

    let passedTestCases = 0;
    let finalVerdict = "Accepted";

    let executionTime = 0;
    let memoryUsed = 0;

    let errorDetails = null;

    for (const testCase of problem.testCases) {
      const result =
        await executeCode({
          code,
          language,
          stdin:
            testCase.input,

          expectedOutput:
            testCase.expectedOutput,
        });

      const status =
        result.status?.description;

      console.log(
        `Test ${
          passedTestCases + 1
        }:`,
        status,
      );

      if (status !== "Accepted") {
        finalVerdict =
          status ||
          "Execution Error";

        errorDetails = {
          stderr:
            result.stderr,

          compileOutput:
            result.compile_output,
        };

        break;
      }

      passedTestCases++;

      executionTime +=
        Number(result.time || 0);

      memoryUsed =
        Math.max(
          memoryUsed,
          Number(
            result.memory || 0,
          ),
        );
    }

    const submission =
      await Submission.create({
        user:
          req.user._id,

        problem:
          problem._id,

        code,

        language,

        verdict:
          finalVerdict,

        passedTestCases,

        totalTestCases:
          problem.testCases.length,

        executionTime,

        memoryUsed,
      });
      if (finalVerdict === "Accepted") {
  const user = await User.findById(
    req.user._id,
  );

  const alreadySolved =
    user.solvedProblems.some(
      (problemId) =>
        problemId.toString() ===
        problem._id.toString(),
    );

  if (!alreadySolved) {
    user.solvedProblems.push(
      problem._id,
    );

    await user.save();

    await Problem.findByIdAndUpdate(
      problem._id,
      {
        $inc: {
          solved: 1,
        },
      },
    );
  }
}

    return res.status(201).json({
      success: true,

      message:
        "Code submitted successfully",

      result: {
        verdict:
          finalVerdict,

        passedTestCases,

        totalTestCases:
          problem.testCases.length,

        executionTime,

        memoryUsed,

        errorDetails,
      },

      submissionId:
        submission._id,
    });
  } catch (error) {
    console.error(
      "SUBMISSION ERROR:",
      error.response?.data ||
        error.message,
    );

    return res.status(500).json({
      success: false,

      message:
        "Code submission failed",

      error:
        error.response?.data ||
        error.message,
    });
  }
};


// ==============================
// MY SUBMISSIONS
// ==============================

export const getMySubmissions =
  async (req, res) => {
    try {
      const submissions =
        await Submission.find({
          user:
            req.user._id,
        })
          .populate(
            "problem",
            "title slug difficulty topic",
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          submissions.length,

        submissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch submissions",

        error:
          error.message,
      });
    }
  };


// ==============================
// PROBLEM SUBMISSIONS
// ==============================

export const getProblemSubmissions =
  async (req, res) => {
    try {
      const {
        problemId,
      } = req.params;

      const submissions =
        await Submission.find({
          user:
            req.user._id,

          problem:
            problemId,
        })
          .select("-code")
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          submissions.length,

        submissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch problem submissions",

        error:
          error.message,
      });
    }
  };


// ==============================
// SINGLE SUBMISSION
// ==============================

export const getSubmissionById =
  async (req, res) => {
    try {
      const submission =
        await Submission.findOne({
          _id:
            req.params.id,

          user:
            req.user._id,
        }).populate(
          "problem",
          "title slug difficulty topic",
        );

      if (!submission) {
        return res.status(404).json({
          success: false,

          message:
            "Submission not found",
        });
      }

      return res.status(200).json({
        success: true,
        submission,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch submission",

        error:
          error.message,
      });
    }
  };