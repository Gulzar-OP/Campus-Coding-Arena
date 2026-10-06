import mongoose from "mongoose";

import Submission from "../models/submission.js";
import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";

import { queueCodeExecution } from "../services/codeQueueService.js";

import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";

// ============================================================
// SUBMIT CODE
// POST /api/submissions/submit
// ============================================================

export const submitCode = async (req, res) => {
  try {
    const { testId, problemId, code, language } = req.body;

    if (!testId || !problemId || !code?.trim() || !language) {
      return res.status(400).json({
        success: false,
        message: "Test, problem, code and language are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(testId) ||
      !mongoose.Types.ObjectId.isValid(problemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid test or problem id",
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
    // TEST AVAILABILITY
    // ========================================================

    if (test.status !== "published" || test.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Test is not available",
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

      isHidden: Boolean(item.isHidden),
    }));

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
    } catch (runnerError) {
      console.error("SUBMISSION CODE RUNNER ERROR:", runnerError);

      return res.status(500).json({
        success: false,
        message: "Code execution service failed",
        error: runnerError.message || "Unknown execution error",
      });
    }

    // ========================================================
    // RUNNER RESULT
    // ========================================================

    const results = runnerResult.results || [];

    const passedTestCases =
      runnerResult.passedTestCases ??
      results.filter(
        (item) => item.passed === true || item.status === "Accepted",
      ).length;

    const totalTestCases = runnerResult.totalTestCases ?? testCases.length;

    // ========================================================
    // VERDICT
    // ========================================================

    let verdict = runnerResult.status || "Wrong Answer";

    if (passedTestCases === totalTestCases && totalTestCases > 0) {
      verdict = "Accepted";
    }

    if (String(verdict).toLowerCase() === "accepted") {
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

    const stderr = runnerResult.stderr || firstResult.stderr || null;

    // ========================================================
    // FIND TEST-WISE SUBMISSION
    // One User + One Test = One Submission document
    // ========================================================

    let submission = await Submission.findOne({
      user: req.user._id,

      test: testId,
    });

    // ========================================================
    // BLOCK AFTER FINAL SUBMISSION
    // ========================================================

    if (submission?.status === "submitted") {
      return res.status(409).json({
        success: false,
        message: "This test has already been submitted",
      });
    }

    // ========================================================
    // CREATE FIRST SUBMISSION DOCUMENT
    // ========================================================

    if (!submission) {
      submission = new Submission({
        user: req.user._id,
        test: testId,
        problems: [],
        status: "in_progress",
      });
    }

    // ========================================================
    // FIND EXISTING PROBLEM
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
      executionTime,
      memory,
      compileOutput,
      stderr,
      submittedAt: new Date(),
    };

    // ========================================================
    // UPDATE EXISTING OR ADD NEW
    // ========================================================

    if (existingProblemIndex !== -1) {
      submission.problems[existingProblemIndex] = problemSubmission;
    } else {
      submission.problems.push(problemSubmission);
    }

    // ========================================================
    // SAVE SUBMISSION
    // ========================================================

    await submission.save();

    // ========================================================
    // UPDATE TEMPORARY ATTEMPT
    // ========================================================

    const attemptProblemIndex = attempt.problemResults.findIndex(
      (item) => String(item.problem) === String(problemId),
    );

    const problemStatus = verdict === "Accepted" ? "passed" : "failed";

    if (attemptProblemIndex !== -1) {
      attempt.problemResults[attemptProblemIndex].status = problemStatus;

      attempt.problemResults[attemptProblemIndex].submission = submission._id;
    } else {
      attempt.problemResults.push({
        problem: problemId,

        status: problemStatus,

        submission: submission._id,
      });
    }

    await attempt.save();

    // ========================================================
    // QUESTION STATS
    // ========================================================

    const attemptedProblems = submission.problems.length;

    const solvedProblems = submission.problems.filter(
      (item) => item.verdict === "Accepted",
    ).length;

    const totalProblems = test.problems.length;

    // ========================================================
    // SAFE RESULTS
    // Hidden test cases ke input/output expose nahi karenge
    // ========================================================

    const safeResults = results.map((result, index) => {
      const originalCase = testCases[index];

      const isHidden = originalCase?.isHidden === true;

      if (isHidden) {
        return {
          testCase: result.testCase || index + 1,

          hidden: true,

          status:
            result.status || (result.passed ? "Accepted" : "Wrong Answer"),

          executionTimeMs: result.executionTimeMs ?? result.time ?? null,
        };
      }

      return result;
    });

    return res.status(200).json({
      success: true,
      message: verdict === "Accepted" ? "Problem accepted" : verdict,
      verdict,
      passedTestCases,
      totalTestCases,
      attemptedProblems,
      solvedProblems,
      totalProblems,
      submission: {
        _id: submission._id,
        test: submission.test,
        problem: problemId,
        verdict,
        passedTestCases,
        totalTestCases,
        executionTime,
        memory,
        compileOutput,
        stderr,
        status: submission.status,
      },

      results: safeResults,
    });
  } catch (error) {
    console.error("SUBMIT CODE ERROR:", error);

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

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
    })
      .populate({
        path: "test",

        select: "title description duration status startTime endTime problems",
      })

      .populate({
        path: "problems.problem",

        select: "title slug difficulty topic",
      })

      .sort({
        createdAt: -1,
      });

    const formatted = submissions.map((submission) => {
      const totalProblems = submission.test?.problems?.length || 0;

      const attemptedProblems = submission.problems?.length || 0;

      const solvedProblems =
        submission.problems?.filter((item) => item.verdict === "Accepted")
          .length || 0;

      return {
        ...submission.toObject(),

        stats: {
          totalProblems,
          attemptedProblems,
          solvedProblems,
          unsolvedProblems: Math.max(totalProblems - solvedProblems, 0),
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      submissions: formatted,
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

export const getProblemSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid problem id",
      });
    }

    const submissions = await Submission.find({
      user: req.user._id,

      "problems.problem": problemId,
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

    const formatted = submissions
      .map((submission) => {
        const problemData = submission.problems.find(
          (item) =>
            String(item.problem?._id || item.problem) === String(problemId),
        );

        if (!problemData) {
          return null;
        }

        return {
          submissionId: submission._id,
          test: submission.test,
          problem: problemData,
          status: submission.status,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          submittedAt: submission.submittedAt || null,
        };
      })
      .filter(Boolean);

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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,

        message: "Invalid submission id",
      });
    }

    const submission = await Submission.findOne({
      _id: id,

      user: req.user._id,
    })
      .populate({
        path: "test",

        select: "title description duration startTime endTime status problems",
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

    const totalProblems = submission.test?.problems?.length || 0;

    const attemptedProblems = submission.problems?.length || 0;

    const solvedProblems =
      submission.problems?.filter((item) => item.verdict === "Accepted")
        .length || 0;

    return res.status(200).json({
      success: true,

      submission,

      stats: {
        totalProblems,
        attemptedProblems,
        solvedProblems,
        unsolvedProblems: Math.max(totalProblems - solvedProblems, 0),
      },
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

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid test id",
      });
    }

    const submission = await Submission.findOne({
      user: req.user._id,

      test: testId,
    })
      .populate({
        path: "test",

        select: "title description duration startTime endTime status problems",
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

    const totalProblems = submission.test?.problems?.length || 0;

    const attemptedProblems = submission.problems?.length || 0;

    const solvedProblems =
      submission.problems?.filter((item) => item.verdict === "Accepted")
        .length || 0;

    const failedProblems =
      submission.problems?.filter((item) => item.verdict !== "Accepted")
        .length || 0;

    return res.status(200).json({
      success: true,

      submission,

      stats: {
        totalProblems,
        attemptedProblems,
        solvedProblems,
        failedProblems,
        notAttemptedProblems: Math.max(totalProblems - attemptedProblems, 0),
        unsolvedProblems: Math.max(totalProblems - solvedProblems, 0),
      },
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
