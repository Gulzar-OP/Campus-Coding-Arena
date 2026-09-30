import Submission from "../models/submission.js";
import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import { executeCode } from "../services/judge0Service.js";
import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";

// SUBMIT CODE
export const submitCode = async (req, res) => {
  try {
    const { testId, problemId, code, language } = req.body;
    if (!testId || !problemId || !code?.trim() || !language) {
      return res.status(400).json({
        success: false,
        message: "Test, problem, code and language are required",
      });
    }
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }
    // TEST MUST BE PUBLISHED
    if (test.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Test is not published",
      });
    }
    // GET ACTIVE ATTEMPT
    const attempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active test attempt not found",
      });
    }

    // CHECK TIMER
    const deadline = getAttemptDeadline(attempt, test);

    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (now.getTime() >= deadlineDate.getTime()) {
      attempt.status = "expired";
      attempt.submittedAt = now;
      await attempt.save();

      return res.status(403).json({
        success: false,
        message: "Test time has expired",
      });
    }
    // CHECK PROBLEM BELONGS TO TEST
    const problemEntry = test.problems.find(
      (item) => String(item.problem) === String(problemId),
    );

    if (!problemEntry) {
      return res.status(403).json({
        success: false,
        message: "Problem does not belong to this test",
      });
    }

    // GET PROBLEM
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    if (!problem.isActive) {
      return res.status(400).json({
        success: false,
        message: "Problem is inactive",
      });
    }

    // CHECK TEST CASES
    if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No test cases available",
      });
    }

    // ==============================
    // EXECUTION VARIABLES
    // ==============================
    let passedTestCases = 0;
    let finalVerdict = "Accepted";
    let executionTime = 0;
    let memoryUsed = 0;
    let errorDetails = null;

    // EXECUTE ALL TEST CASES
    for (let index = 0; index < problem.testCases.length; index++) {
      const testCase = problem.testCases[index];

      let result;

      try {
        result = await executeCode({
          code,
          language,

          stdin: testCase.input || "",

          expectedOutput: testCase.expectedOutput || "",
        });
      } catch (executionError) {
        console.error("CODE EXECUTION ERROR:", executionError.message);

        return res.status(500).json({
          success: false,
          message: "Code execution service failed",
          error: executionError.message,
        });
      }

      // TIME
      executionTime += Number(result.time || 0);
      // MEMORY
      memoryUsed = Math.max(memoryUsed, Number(result.memory || 0));

      // JUDGE0 STATUS
      const status = result.status?.description || "Execution Error";

      if (status !== "Accepted") {
        finalVerdict = status;

        errorDetails = {
          testCase: index + 1,

          stderr: result.stderr || null,

          compileOutput: result.compile_output || null,

          message: result.message || null,
        };

        break;
      }

      passedTestCases++;
    }

    // ==============================
    // CHECK ALL PASSED
    // ==============================
    const totalTestCases = problem.testCases.length;

    const allPassed =
      finalVerdict === "Accepted" && passedTestCases === totalTestCases;

    // ==============================
    // FIND ATTEMPT PROBLEM RESULT
    // ==============================
    const problemResult = attempt.problemResults.find(
      (item) => String(item.problem) === String(problemId),
    );

    if (!problemResult) {
      return res.status(500).json({
        success: false,
        message: "Problem result not found in attempt",
      });
    }

    // Important:
    // Previous state check before
    // changing status.
    const alreadySolved = problemResult.status === "passed";

    // ==============================
    // CREATE SUBMISSION
    // ==============================
    const submission = await Submission.create({
      user: req.user._id,

      problem: problem._id,

      code,

      language,

      verdict: finalVerdict,

      passedTestCases,

      totalTestCases,

      executionTime,

      memoryUsed,
    });

    // ==============================
    // UPDATE PROBLEM RESULT
    // ==============================
    problemResult.status = allPassed ? "passed" : "failed";

    problemResult.submission = submission._id;

    const marks = Number(problemEntry.marks || 0);

    problemResult.marksObtained = allPassed ? marks : 0;

    // ==============================
    // INCREMENT GLOBAL SOLVED COUNT
    // ==============================
    if (allPassed && !alreadySolved) {
      await Problem.findByIdAndUpdate(problemId, {
        $inc: {
          solved: 1,
        },
      });
    }

    // ==============================
    // CALCULATE ATTEMPT TOTAL MARKS
    // ==============================
    attempt.totalMarks = attempt.problemResults.reduce(
      (total, item) => total + Number(item.marksObtained || 0),
      0,
    );

    await attempt.save();

    // ==============================
    // RESPONSE
    // ==============================
    return res.status(201).json({
      success: true,

      message: allPassed
        ? "Problem solved successfully"
        : "Code evaluated successfully",

      submission: {
        _id: submission._id,

        verdict: finalVerdict,

        passedTestCases,

        totalTestCases,

        executionTime,

        memoryUsed,

        errorDetails,

        problemStatus: problemResult.status,

        marksObtained: problemResult.marksObtained,

        totalMarks: attempt.totalMarks,
      },

      attempt: {
        deadline: deadlineDate,

        totalMarks: attempt.totalMarks,

        status: attempt.status,
      },
    });
  } catch (error) {
    console.error("========== SUBMIT CODE ERROR ==========");

    console.error(error.response?.data || error.stack || error.message);

    return res.status(500).json({
      success: false,

      message: "Code submission failed",

      error: error.response?.data || error.message,
    });
  }
};

// MY SUBMISSIONS
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
    })
      .populate("problem", "title slug difficulty topic")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// SUBMISSIONS FOR ONE PROBLEM
export const getProblemSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;

    const submissions = await Submission.find({
      user: req.user._id,
      problem: problemId,
    })
      .select("-code")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem submissions",
      error: error.message,
    });
  }
};

// SINGLE SUBMISSION
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("problem", "title slug difficulty topic");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};
