import Submission from "../models/submission.js";
import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";

import {
  queueCodeExecution,
} from "../services/codeQueueService.js";

import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";

// ============================================================
// SUBMIT CODE
// POST /api/submissions/submit
// ============================================================

export const submitCode = async (req, res) => {
  try {
    const { testId, problemId, code, language } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!testId || !problemId || !code?.trim() || !language) {
      return res.status(400).json({
        success: false,

        message: "Test, problem, code and language are required",
      });
    }

    // ========================================================
    // GET TEST
    // ========================================================

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // ========================================================
    // TEST STATUS
    // ========================================================

    if (test.status !== "published") {
      return res.status(400).json({
        success: false,

        message: "Test is not published",
      });
    }

    // ========================================================
    // ACTIVE ATTEMPT
    // ========================================================

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

    // ========================================================
    // TIMER CHECK
    // ========================================================

    const deadline = getAttemptDeadline(attempt, test);

    const now = new Date();

    const deadlineDate = new Date(deadline);

    if (now.getTime() >= deadlineDate.getTime()) {
      attempt.status = "expired";

      attempt.submittedAt = now;

      await attempt.save();

      return res.status(403).json({
        success: false,

        message: "Assessment time has expired",
      });
    }

    // ========================================================
    // CHECK PROBLEM BELONGS TO TEST
    // ========================================================

    const testProblem = test.problems.find(
      (item) => String(item.problem?._id || item.problem) === String(problemId),
    );

    if (!testProblem) {
      return res.status(403).json({
        success: false,

        message: "Problem does not belong to this test",
      });
    }

    // ========================================================
    // GET PROBLEM
    // ========================================================

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message: "Problem not found",
      });
    }

    if (problem.isActive === false) {
      return res.status(400).json({
        success: false,

        message: "Problem is inactive",
      });
    }

    // ========================================================
    // CHECK TEST CASES
    // ========================================================

    if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
      return res.status(400).json({
        success: false,

        message: "No test cases found for this problem",
      });
    }

    // ========================================================
    // PREPARE TEST CASES
    // ========================================================

    const testCases = problem.testCases.map((item) => ({
      input: item.input || "",

      expectedOutput: item.expectedOutput || "",

      isHidden: item.isHidden || false,
    }));

    console.log("========== SUBMISSION ==========");

    console.log({
      testId,
      problemId,
      language,

      totalTestCases: testCases.length,
    });

    // ========================================================
    // EXECUTE CODE
    // ========================================================

    let runnerResult;

    try {
      runnerResult = await queueCodeExecution({
        code,
        language,
        testCases,
      });

      console.log("SUBMISSION RUNNER RESULT:", runnerResult);
    } catch (runnerError) {
      console.error(
        "SUBMISSION CODE RUNNER ERROR:",
        runnerError.message || runnerError,
      );

      return res.status(500).json({
        success: false,

        message: "Code execution service failed",

        error: runnerError.message || "Unknown execution error",
      });
    }

    // ========================================================
    // RESULT
    // ========================================================

    const results = runnerResult.results || [];

    const passedTestCases =
      runnerResult.passedTestCases ??
      results.filter((item) => item.passed === true).length;

    const totalTestCases = runnerResult.totalTestCases ?? testCases.length;

    // ========================================================
    // VERDICT
    // ========================================================

    let verdict = runnerResult.status || "Wrong Answer";

    if (passedTestCases === totalTestCases && totalTestCases > 0) {
      verdict = "Accepted";
    }

    if (verdict === "accepted") {
      verdict = "Accepted";
    }

    // ========================================================
    // EXECUTION DETAILS
    // ========================================================

    const firstResult = results[0] || {};

    const executionTime =
      firstResult.executionTimeMs ?? firstResult.time ?? null;

    const memory = firstResult.memory ?? null;

    const compileOutput =
      runnerResult.compileOutput || firstResult.compileOutput || null;

    // ========================================================
    // MARKS
    // ========================================================

    const marks = verdict === "Accepted" ? Number(testProblem.marks || 0) : 0;

    // ========================================================
    // FIND TEST-WISE SUBMISSION
    // One User + One Test = One Document
    // ========================================================

    let submission = await Submission.findOne({
      user: req.user._id,

      test: testId,
    });

    // ========================================================
    // CREATE IF FIRST PROBLEM SUBMISSION
    // ========================================================

    if (!submission) {
      submission = new Submission({
        user: req.user._id,

        test: testId,

        problems: [],

        totalMarks: 0,

        status: "in_progress",
      });
    }

    // ========================================================
    // FIND EXISTING PROBLEM INSIDE TEST SUBMISSION
    // ========================================================

    const existingProblemIndex = submission.problems.findIndex(
      (item) => String(item.problem) === String(problemId),
    );

    // ========================================================
    // PROBLEM SUBMISSION DATA
    // ========================================================

    const problemSubmission = {
      problem: problemId,

      code,

      language,

      verdict,

      passedTestCases,

      totalTestCases,

      marks,

      executionTime,

      memory,

      submittedAt: new Date(),
    };

    // ========================================================
    // UPDATE SAME PROBLEM
    // OR ADD NEW PROBLEM
    // ========================================================

    if (existingProblemIndex !== -1) {
      submission.problems[existingProblemIndex] = problemSubmission;
    } else {
      submission.problems.push(problemSubmission);
    }

    // ========================================================
    // CALCULATE TOTAL MARKS
    // ========================================================

    submission.totalMarks = submission.problems.reduce(
      (total, item) => total + Number(item.marks || 0),

      0,
    );

    // ========================================================
    // SAVE
    // ========================================================

    await submission.save();

    // YAHAN ADD KARO

    const attemptProblemIndex = attempt.problemResults.findIndex(
      (item) => String(item.problem) === String(problemId),
    );

    if (attemptProblemIndex !== -1) {
      attempt.problemResults[attemptProblemIndex].status =
        verdict === "Accepted" ? "passed" : "failed";

      attempt.problemResults[attemptProblemIndex].submission = submission._id;
    } else {
      attempt.problemResults.push({
        problem: problemId,
        status: verdict === "Accepted" ? "passed" : "failed",
        submission: submission._id,
      });
    }

    await attempt.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: verdict === "Accepted" ? "Problem accepted" : verdict,

      verdict,
      passedTestCases,
      totalTestCases,
      marks,
      totalMarks: submission.totalMarks,

      submission: {
        _id: submission._id,
        test: submission.test,
        problem: problemId,
        verdict,
        passedTestCases,
        totalTestCases,
        marks,
        totalMarks: submission.totalMarks,
        executionTime,
        memory,
        compileOutput,
      },

      results,
    });
  } catch (error) {
    console.error("SUBMIT CODE ERROR:", error);

    // duplicate index safety
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message: "Submission already exists for this test. Please retry.",
      });
    }

    return res.status(500).json({
      success: false,

      message: "Submission failed",

      error: error.message,
    });
  }
};

// ============================================================
// MY SUBMISSIONS
// GET /api/submissions/my
// ============================================================

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
    })
      .populate({
        path: "test",

        select: "title description duration status",
      })
      .populate({
        path: "problems.problem",

        select: "title slug difficulty topic",
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: submissions.length,

      submissions,
    });
  } catch (error) {
    console.error("GET MY SUBMISSIONS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch submissions",

      error: error.message,
    });
  }
};

// ============================================================
// SUBMISSIONS FOR ONE PROBLEM
// GET /api/submissions/problem/:problemId
// ============================================================

export const getProblemSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;

    const submissions = await Submission.find({
      user: req.user._id,

      "problems.problem": problemId,
    })
      .populate({
        path: "test",

        select: "title description",
      })
      .populate({
        path: "problems.problem",

        select: "title slug difficulty topic",
      })
      .sort({
        createdAt: -1,
      });

    // only requested problem details
    const formatted = submissions.map((submission) => {
      const problemData = submission.problems.find(
        (item) =>
          String(item.problem?._id || item.problem) === String(problemId),
      );

      return {
        submissionId: submission._id,

        test: submission.test,

        problem: problemData,

        totalMarks: submission.totalMarks,

        status: submission.status,

        createdAt: submission.createdAt,

        updatedAt: submission.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,

      count: formatted.length,

      submissions: formatted,
    });
  } catch (error) {
    console.error("GET PROBLEM SUBMISSIONS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch problem submissions",

      error: error.message,
    });
  }
};

// ============================================================
// SINGLE SUBMISSION
// GET /api/submissions/:id
// ============================================================

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,

      user: req.user._id,
    })
      .populate({
        path: "test",

        select: "title description duration",
      })
      .populate({
        path: "problems.problem",

        select: "title slug difficulty topic description",
      });

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
    console.error("GET SUBMISSION ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch submission",

      error: error.message,
    });
  }
};

// ============================================================
// GET SUBMISSION FOR ONE TEST
// GET /api/submissions/test/:testId
// ============================================================

export const getTestSubmission = async (req, res) => {
  try {
    const { testId } = req.params;

    const submission = await Submission.findOne({
      user: req.user._id,

      test: testId,
    })
      .populate({
        path: "test",

        select: "title description duration",
      })
      .populate({
        path: "problems.problem",

        select: "title slug difficulty topic",
      });

    if (!submission) {
      return res.status(404).json({
        success: false,

        message: "No submission found for this test",
      });
    }

    return res.status(200).json({
      success: true,

      submission,
    });
  } catch (error) {
    console.error("GET TEST SUBMISSION ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch test submission",

      error: error.message,
    });
  }
};
