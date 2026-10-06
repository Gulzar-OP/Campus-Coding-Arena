import mongoose from "mongoose";
import User from "../models/User.js";
import Submission from "../models/submission.js";
import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";

export const getStudentAttemptDetails = async (req, res) => {
  try {
    const { id: testId, attemptId } = req.params;

    // ==============================
    // CHECK TEST
    // ==============================

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // ==============================
    // CHECK TEACHER OWNERSHIP
    // ==============================

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot view this attempt",
      });
    }

    // ==============================
    // GET ATTEMPT
    // ==============================

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      test: testId,
    })
      .populate("student", "name email branch year")
      .populate(
        "problemResults.problem",
        "title slug difficulty topic description",
      )
      .populate({
        path: "problemResults.submission",

        select:
          "code language verdict passedTestCases totalTestCases executionTime memoryUsed createdAt",
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Student attempt not found",
      });
    }

    // ==============================
    // FORMAT PROBLEM RESULTS
    // ==============================

    const problems = attempt.problemResults.map((item) => ({
      problem: item.problem,

      status: item.status,

      marksObtained: item.marksObtained,

      submission: item.submission
        ? {
            id: item.submission._id,

            language: item.submission.language,

            code: item.submission.code,

            verdict: item.submission.verdict,

            passedTestCases: item.submission.passedTestCases,

            totalTestCases: item.submission.totalTestCases,

            executionTime: item.submission.executionTime,

            memoryUsed: item.submission.memoryUsed,

            submittedAt: item.submission.createdAt,
          }
        : null,
    }));

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(200).json({
      success: true,

      test: {
        id: test._id,

        title: test.title,

        duration: test.duration,

        maxAIPrompts: test.maxAIPrompts,
      },

      attempt: {
        id: attempt._id,

        student: attempt.student,

        status: attempt.status,

        startedAt: attempt.startedAt,

        submittedAt: attempt.submittedAt,

        aiPromptsUsed: attempt.aiPromptsUsed,

        totalMarks: attempt.totalMarks,

        problems,
      },
    });
  } catch (error) {
    console.error("GET STUDENT ATTEMPT ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch student attempt",

      error: error.message,
    });
  }
};

export const getMyAttempt = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const attempt = await TestAttempt.findOne({
      test: id,
      student: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // Test start ke time se duration calculate
    const startedAt = attempt.startedAt || attempt.createdAt;

    const durationInMs = test.duration * 60 * 1000;

    const attemptDeadline = new Date(
      new Date(startedAt).getTime() + durationInMs,
    );

    // Test ka actual endTime bhi cross
    // nahi karna chahiye
    const testEndTime = new Date(test.endTime);

    const deadline =
      attemptDeadline < testEndTime ? attemptDeadline : testEndTime;

    const now = new Date();

    const remainingSeconds = Math.max(
      Math.floor((deadline.getTime() - now.getTime()) / 1000),
      0,
    );

    return res.status(200).json({
      success: true,

      attempt,

      deadline,

      remainingSeconds,
    });
  } catch (error) {
    console.error("GET MY ATTEMPT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempt",
      error: error.message,
    });
  }
};

export const addProblemToTest = async (req, res) => {
  try {
    const { problemId, marks = 10 } = req.body;

    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const alreadyAdded = test.problems.some(
      (item) => String(item.problem) === String(problemId),
    );

    if (alreadyAdded) {
      return res.status(409).json({
        success: false,
        message: "Problem already added to test",
      });
    }

    test.problems.push({
      problem: problemId,
      marks,
    });

    await test.save();

    await test.populate("problems.problem", "title difficulty topic");

    return res.status(200).json({
      success: true,
      message: "Problem added successfully",
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add problem",
      error: error.message,
    });
  }
};

export const repairTestProblems = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const repairedProblems = [];

    for (const item of test.problems) {
      const problemId = item.problem?._id || item.problem;

      if (!problemId) continue;

      const exists = await Problem.exists({
        _id: problemId,
      });

      if (exists) {
        repairedProblems.push(item);
      }
    }

    test.problems = repairedProblems;

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Broken problem references removed",
      remainingProblems: repairedProblems.length,
      test,
    });
  } catch (error) {
    console.error("REPAIR TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to repair test",
      error: error.message,
    });
  }
};

export const getParticipantDetails = async (req, res) => {
  try {
    const { testId, studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(testId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid test or student id",
      });
    }

    const test = await Test.findById(testId)
      .populate({
        path: "problems.problem",
        select: "title topic difficulty timeComplexity spaceComplexity",
      })
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      String(test.createdBy) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this participant",
      });
    }

    const student = await User.findById(studentId)
      .select("name email branch year rollNo")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const [submission, attempt] = await Promise.all([
      Submission.findOne({
        test: testId,
        user: studentId,
      }).lean(),

      TestAttempt.findOne({
        test: testId,
        student: studentId,
      }).lean(),
    ]);

    if (!submission && !attempt) {
      return res.status(404).json({
        success: false,
        message: "No attempt or submission found for this student",
      });
    }

    const submissionMap = new Map();

    if (submission?.problems?.length) {
      for (const item of submission.problems) {
        submissionMap.set(String(item.problem), item);
      }
    }

    const attemptMap = new Map();

    if (attempt?.problemResults?.length) {
      for (const item of attempt.problemResults) {
        attemptMap.set(String(item.problem), item);
      }
    }

    const problems = (test.problems || []).map((testProblem) => {
      const problem = testProblem.problem;

      const problemId = String(problem?._id || problem);

      const submittedItem = submissionMap.get(problemId);

      const attemptItem = attemptMap.get(problemId);

      if (submittedItem) {
        const accepted = submittedItem.verdict === "Accepted";

        return {
          problem,

          status: accepted ? "passed" : "failed",

          submission: {
            language: submittedItem.language || "",

            verdict: submittedItem.verdict || "",

            passedTestCases: submittedItem.passedTestCases ?? 0,

            totalTestCases: submittedItem.totalTestCases ?? 0,

            executionTime: submittedItem.executionTime ?? null,

            memory: submittedItem.memory ?? submittedItem.memoryUsed ?? null,

            sourceCode: submittedItem.sourceCode ?? submittedItem.code ?? "",

            compileOutput: submittedItem.compileOutput ?? "",

            stderr: submittedItem.stderr ?? "",

            submittedAt: submittedItem.submittedAt ?? null,
          },
        };
      }

      return {
        problem,

        status: attemptItem?.status || "not_attempted",

        submission: null,
      };
    });

    const totalProblems = problems.length;

    const attemptedProblems = problems.filter(
      (item) => item.status !== "not_attempted",
    ).length;

    const solvedProblems = problems.filter(
      (item) => item.status === "passed",
    ).length;

    const failedProblems = problems.filter(
      (item) => item.status === "failed",
    ).length;

    return res.status(200).json({
      success: true,

      test: {
        _id: test._id,

        title: test.title,

        description: test.description,

        duration: test.duration,

        maxAIPrompts: test.maxAIPrompts,

        totalProblems,
      },

      attempt: {
        student,

        status: submission?.status || attempt?.status || "in_progress",

        startedAt: attempt?.startedAt || submission?.createdAt || null,

        submittedAt: submission?.submittedAt || null,

        aiPromptsUsed: attempt?.aiPromptsUsed || 0,

        aiHistory: attempt?.aiHistory || [],

        totalProblems,

        attemptedProblems,

        solvedProblems,

        failedProblems,

        problems,
      },
    });
  } catch (error) {
    console.error("GET PARTICIPANT DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attempt",
      error: error.message,
    });
  }
};
