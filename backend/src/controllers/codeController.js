import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import { queueCodeExecution } from "../services/codeQueueService.js";

// import {
//   executeSubmissionCode,
// } from "../services/judge0Service.js";

import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";

export const runCode = async (req, res) => {
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
    if (test.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Test is not published",
      });
    }

    // CHECK ACTIVE ATTEMPT
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
    const testProblem = test.problems.find(
      (item) => String(item.problem?._id ?? item.problem) === String(problemId),
    );

    if (!testProblem) {
      return res.status(403).json({
        success: false,
        message: "Problem does not belong to this test",
      });
    }

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

    // CHECK TEST CASES
    if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No test cases found for this problem",
      });
    }

    const visibleTestCases = problem.testCases.filter(
      (testCase) => testCase.isHidden !== true,
    );

    if (visibleTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No visible test cases available",
      });
    }
    let runnerResult;

    try {
      // console.log("========== CODE RUNNER ==========");

      // console.log({
      //   testId,
      //   problemId,
      //   language,
      //   totalVisibleTestCases: visibleTestCases.length,
      // });

      runnerResult = await queueCodeExecution({
        code,
        language,
        testCases: visibleTestCases,
        userId: req.user._id,
        testId,
        problemId,
      });
      console.log("CODE RUNNER RESULT:", runnerResult);
    } catch (runnerError) {
      console.error("CODE RUNNER ERROR:", runnerError.message || runnerError);

      return res.status(500).json({
        success: false,
        message: "Code execution failed",
        error: runnerError.message || "Unknown code runner error",
      });
    }

    // ==============================
    // RESULT MAPPING
    // ==============================
    const firstResult = runnerResult.results?.[0] ?? {};
    const status = runnerResult.status ?? "Internal Error";
    const stdout = firstResult.actualOutput ?? "";
    const expectedOutput = firstResult.expectedOutput ?? "";
    const stderr = firstResult.stderr || null;
    const compileOutput = runnerResult.compileOutput || null;
    return res.status(200).json({
      success: true,

      result: {
        status,
        stdout,
        expectedOutput,
        time: firstResult.executionTimeMs ?? null,
        memory: null,
        stderr,
        compileOutput,
        passedTestCases: runnerResult.passedTestCases ?? 0,
        totalTestCases: runnerResult.totalTestCases ?? visibleTestCases.length,
        totalDurationMs: runnerResult.totalDurationMs ?? null,
        results: runnerResult.results ?? [],
      },

      problem: {
        id: problem._id,
        title: problem.title,
        marks: testProblem.marks,
      },

      attempt: {
        deadline: deadlineDate,
        aiPromptsUsed: attempt.aiPromptsUsed ?? 0,
      },
    });
  } catch (error) {
    console.error("========== CODE RUN ERROR ==========");

    console.error(error.response?.data || error.stack || error.message);

    return res.status(500).json({
      success: false,
      message: "Code execution failed",
      error: error.response?.data || error.message,
    });
  }
};
