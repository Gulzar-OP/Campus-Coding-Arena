import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";

import {
  executeCode,
} from "../services/judge0Service.js";

import {
  getAttemptDeadline,
} from "../utils/getAttemptDeadline.js";

export const runCode = async (req, res) => {
  try {
    const {
      testId,
      problemId,
      code,
      language,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================
    if (
      !testId ||
      !problemId ||
      !code?.trim() ||
      !language
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Test, problem, code and language are required",
      });
    }

    // ==============================
    // CHECK TEST
    // ==============================
    const test =
      await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // ==============================
    // CHECK TEST STATUS
    // ==============================
    if (
      test.status !==
      "published"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Test is not published",
      });
    }

    // ==============================
    // CHECK ACTIVE ATTEMPT
    // ==============================
    const attempt =
      await TestAttempt.findOne({
        test: testId,
        student: req.user._id,
        status: "in_progress",
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Active test attempt not found",
      });
    }

    // ==============================
    // CHECK TIMER
    // ==============================
    const deadline =
      getAttemptDeadline(
        attempt,
        test,
      );

    const deadlineDate =
      new Date(deadline);

    const now =
      new Date();

    if (
      now.getTime() >=
      deadlineDate.getTime()
    ) {
      attempt.status =
        "expired";

      attempt.submittedAt =
        now;

      await attempt.save();

      return res.status(403).json({
        success: false,
        message:
          "Test time has expired",
      });
    }

    // ==============================
    // CHECK PROBLEM BELONGS TO TEST
    // ==============================
    const testProblem =
      test.problems.find(
        (item) =>
          String(
            item.problem,
          ) ===
          String(problemId),
      );

    if (!testProblem) {
      return res.status(403).json({
        success: false,
        message:
          "Problem does not belong to this test",
      });
    }

    // ==============================
    // GET PROBLEM
    // ==============================
    const problem =
      await Problem.findById(
        problemId,
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
      });
    }

    if (!problem.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Problem is inactive",
      });
    }

    // ==============================
    // CHECK TEST CASES
    // ==============================
    if (
      !Array.isArray(
        problem.testCases,
      ) ||
      problem.testCases.length ===
        0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No test cases found for this problem",
      });
    }

    // ==============================
    // GET VISIBLE TEST CASE
    // ==============================
    const visibleTestCase =
      problem.testCases.find(
        (item) =>
          item.isHidden ===
          false,
      );

    const testCase =
      visibleTestCase ||
      problem.testCases[0];

    if (!testCase) {
      return res.status(400).json({
        success: false,
        message:
          "No sample testcase available",
      });
    }

    // ==============================
    // JUDGE0 EXECUTION
    // ==============================
    let result;

    try {
      console.log(
        "========== JUDGE0 RUN ==========",
      );

      console.log({
        testId,
        problemId,
        language,
        stdin:
          testCase.input || "",
        expectedOutput:
          testCase.expectedOutput ||
          "",
      });

      result =
        await executeCode({
          code,
          language,

          stdin:
            testCase.input ||
            "",

          expectedOutput:
            testCase.expectedOutput ||
            "",
        });

      console.log(
        "JUDGE0 RESULT:",
        result,
      );
    } catch (judgeError) {
      console.error(
        "JUDGE0 ERROR:",
        judgeError.response
          ?.data ||
          judgeError.message ||
          judgeError,
      );

      return res.status(500).json({
        success: false,
        message:
          "Judge0 code execution failed",

        error:
          judgeError.response
            ?.data ||
          judgeError.message ||
          "Unknown Judge0 error",
      });
    }

    // ==============================
    // RESULT
    // ==============================
    const status =
      result.status
        ?.description ||
      "Unknown";

    const stdout =
      result.stdout || "";

    const stderr =
      result.stderr || null;

    const compileOutput =
      result.compile_output ||
      null;

    // ==============================
    // RESPONSE
    // ==============================
    return res.status(200).json({
      success: true,

      result: {
        status,

        stdout,

        expectedOutput:
          testCase.expectedOutput ||
          "",

        time:
          result.time ||
          null,

        memory:
          result.memory ||
          null,

        stderr,

        compileOutput,
      },

      problem: {
        id:
          problem._id,

        title:
          problem.title,

        marks:
          testProblem.marks,
      },

      attempt: {
        deadline:
          deadlineDate,

        aiPromptsUsed:
          attempt.aiPromptsUsed ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "========== CODE RUN ERROR ==========",
    );

    console.error(
      error.response?.data ||
        error.stack ||
        error.message,
    );

    return res.status(500).json({
      success: false,

      message:
        "Code execution failed",

      error:
        error.response?.data ||
        error.message,
    });
  }
};