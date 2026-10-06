import mongoose from "mongoose";

import Test from "../models/test.js";
import Problem from "../models/Problem.js";
import TestAttempt from "../models/testAttempt.js";
import Submission from "../models/submission.js";
import User from "../models/User.js";

import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";

import generateAccessCode from "../utils/generateAccessCode.js";

// ============================================================
// HELPERS
// ============================================================

const isTestOwnerOrAdmin = (test, user) => {
  return (
    test.createdBy.toString() === user._id.toString() || user.role === "admin"
  );
};

const normalizeProblemEntries = (problems = []) => {
  return problems.map((item) => ({
    problem:
      typeof item === "string" ? item : item?.problem?._id || item?.problem,
  }));
};

const validateProblemIds = (problemEntries = []) => {
  return problemEntries.every(
    (item) => item.problem && mongoose.Types.ObjectId.isValid(item.problem),
  );
};

const getUniqueProblemIds = (problemEntries = []) => {
  return [...new Set(problemEntries.map((item) => String(item.problem)))];
};

const sanitizeProblemForStudent = (problem) => {
  if (!problem) {
    return null;
  }

  const plainProblem =
    typeof problem.toObject === "function"
      ? problem.toObject()
      : {
          ...problem,
        };

  if (Array.isArray(plainProblem.testCases)) {
    plainProblem.testCases = plainProblem.testCases
      .filter((item) => !item.isHidden)
      .map((item) => ({
        input: item.input,

        expectedOutput: item.expectedOutput,

        isHidden: false,
      }));
  }

  return plainProblem;
};

// ============================================================
// CREATE TEST
// ============================================================

export const createTest = async (req, res) => {
  try {
    const {
      title,
      description = "",
      duration,
      startTime,
      endTime,
      problems = [],
      maxAIPrompts = 3,
      allowDirectAccess = false,
    } = req.body;

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!title?.trim() || !duration || !startTime || !endTime) {
      return res.status(400).json({
        success: false,

        message: "Title, duration, start time and end time are required",
      });
    }

    const numericDuration = Number(duration);

    const numericMaxAIPrompts = Number(maxAIPrompts);

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      return res.status(400).json({
        success: false,

        message: "Duration must be greater than 0",
      });
    }

    if (
      !Number.isInteger(numericMaxAIPrompts) ||
      numericMaxAIPrompts < 0 ||
      numericMaxAIPrompts > 3
    ) {
      return res.status(400).json({
        success: false,

        message: "Maximum AI prompts must be between 0 and 3",
      });
    }

    // --------------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------------

    const start = new Date(startTime);

    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,

        message: "Invalid start time or end time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,

        message: "End time must be after start time",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE PROBLEMS
    //
    // No marks now.
    //
    // [
    //   {
    //     problem: ObjectId
    //   }
    // ]
    // --------------------------------------------------------

    const normalizedProblems = normalizeProblemEntries(problems);

    if (
      normalizedProblems.length > 0 &&
      !validateProblemIds(normalizedProblems)
    ) {
      return res.status(400).json({
        success: false,

        message: "One or more selected problem IDs are invalid",
      });
    }

    // --------------------------------------------------------
    // DUPLICATE PROBLEM CHECK
    // --------------------------------------------------------

    const problemIds = getUniqueProblemIds(normalizedProblems);

    if (problemIds.length !== normalizedProblems.length) {
      return res.status(400).json({
        success: false,

        message: "Duplicate problems are not allowed in a test",
      });
    }

    // --------------------------------------------------------
    // CHECK PROBLEMS EXIST
    // --------------------------------------------------------

    if (problemIds.length > 0) {
      const existingProblems = await Problem.countDocuments({
        _id: {
          $in: problemIds,
        },

        isActive: true,
      });

      if (existingProblems !== problemIds.length) {
        return res.status(400).json({
          success: false,

          message: "One or more selected problems are invalid or inactive",
        });
      }
    }

    // --------------------------------------------------------
    // UNIQUE ACCESS CODE
    // --------------------------------------------------------

    let accessCode;

    let codeExists = true;

    while (codeExists) {
      accessCode = generateAccessCode();

      codeExists = await Test.exists({
        accessCode,
      });
    }

    // --------------------------------------------------------
    // CREATE TEST
    // --------------------------------------------------------

    const test = await Test.create({
      title: title.trim(),

      description,

      duration: numericDuration,

      startTime: start,

      endTime: end,

      problems: normalizedProblems,

      maxAIPrompts: numericMaxAIPrompts,

      allowDirectAccess: Boolean(allowDirectAccess),

      accessCode,

      createdBy: req.user._id,

      status: "draft",
    });

    return res.status(201).json({
      success: true,

      message: "Test created successfully",

      test,
    });
  } catch (error) {
    console.error("CREATE TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to create test",

      error: error.message,
    });
  }
};

// ============================================================
// GET ALL TESTS
// ============================================================

export const getAllTests = async (req, res) => {
  try {
    const filter = {
      isActive: true,
    };

    // Student only published tests dekhega

    if (req.user?.role === "student") {
      filter.status = "published";
    }

    const tests = await Test.find(filter)
      .populate("createdBy", "name email")

      .populate("problems.problem", "title slug difficulty topic")

      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: tests.length,

      tests,
    });
  } catch (error) {
    console.error("GET ALL TESTS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch tests",

      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE TEST
// ============================================================

export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,

        message: "Invalid test id",
      });
    }

    // --------------------------------------------------------
    // GET TEST
    // --------------------------------------------------------

    const test = await Test.findById(id)
      .populate({
        path: "createdBy",

        select: "name email role",
      })

      .populate({
        path: "problems.problem",
      });

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // STUDENT ACCESS CHECK
    // --------------------------------------------------------

    if (req.user?.role === "student") {
      if (test.status !== "published" || test.isActive === false) {
        return res.status(404).json({
          success: false,

          message: "Test not found",
        });
      }
    }

    const plainTest = test.toObject();

    // --------------------------------------------------------
    // HIDE HIDDEN TEST CASES FROM STUDENT
    // --------------------------------------------------------

    if (req.user?.role === "student") {
      plainTest.problems = plainTest.problems.map((entry) => ({
        problem: sanitizeProblemForStudent(entry.problem),

        problemId: entry.problem?._id || entry.problem || null,
      }));
    } else {
      plainTest.problems = plainTest.problems.map((entry) => ({
        problem: entry.problem,

        problemId: entry.problem?._id || entry.problem || null,
      }));
    }

    // --------------------------------------------------------
    // BROKEN REFERENCES
    // --------------------------------------------------------

    const hasMissingProblem = plainTest.problems.some(
      (entry) => !entry.problem,
    );

    if (hasMissingProblem) {
      return res.status(400).json({
        success: false,

        message: "Some problems assigned to this test no longer exist",
      });
    }

    return res.status(200).json({
      success: true,

      test: plainTest,
    });
  } catch (error) {
    console.error("GET TEST BY ID ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch test",

      error: error.message,
    });
  }
};

// ============================================================
// PUBLISH TEST
// ============================================================

export const publishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot publish this test",
      });
    }

    // --------------------------------------------------------
    // MUST HAVE PROBLEM
    // --------------------------------------------------------

    if (!Array.isArray(test.problems) || test.problems.length === 0) {
      return res.status(400).json({
        success: false,

        message: "Add at least one problem before publishing",
      });
    }

    // --------------------------------------------------------
    // PUBLISH
    // --------------------------------------------------------

    test.status = "published";

    await test.save();

    return res.status(200).json({
      success: true,

      message: "Test published successfully",

      test,
    });
  } catch (error) {
    console.error("PUBLISH TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to publish test",

      error: error.message,
    });
  }
};

// ============================================================
// START TEST
// ============================================================

export const startTest = async (req, res) => {
  try {
    const { id: testId } = req.params;

    // --------------------------------------------------------
    // VALIDATE TEST ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid test id",
      });
    }

    // --------------------------------------------------------
    // ALREADY FINALLY SUBMITTED
    // --------------------------------------------------------

    const alreadySubmitted = await Submission.exists({
      user: req.user._id,

      test: testId,

      status: "submitted",
    });

    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,

        message: "You have already submitted this test",
      });
    }

    // --------------------------------------------------------
    // GET TEST
    // --------------------------------------------------------

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // AVAILABILITY
    // --------------------------------------------------------

    if (test.status !== "published" || test.isActive === false) {
      return res.status(400).json({
        success: false,

        message: "Test is not available",
      });
    }

    // --------------------------------------------------------
    // TEST WINDOW
    // --------------------------------------------------------

    const now = new Date();

    const startTime = new Date(test.startTime);

    const endTime = new Date(test.endTime);

    if (now.getTime() < startTime.getTime()) {
      return res.status(400).json({
        success: false,

        message: "Test has not started yet",
      });
    }

    if (now.getTime() > endTime.getTime()) {
      return res.status(400).json({
        success: false,

        message: "Test has already ended",
      });
    }

    // --------------------------------------------------------
    // EXISTING ATTEMPT
    // --------------------------------------------------------

    const existingAttempt = await TestAttempt.findOne({
      test: test._id,

      student: req.user._id,
    });

    if (existingAttempt) {
      return res.status(409).json({
        success: false,

        message: "You have already started this test",

        attempt: existingAttempt,
      });
    }

    // --------------------------------------------------------
    // INITIAL PROBLEM RESULTS
    // --------------------------------------------------------

    const problemResults = test.problems.map((item) => ({
      problem: item.problem,

      status: "not_attempted",

      submission: null,
    }));

    // --------------------------------------------------------
    // CREATE ATTEMPT
    // --------------------------------------------------------

    const attempt = await TestAttempt.create({
      test: test._id,

      student: req.user._id,

      startedAt: new Date(),

      status: "in_progress",

      aiPromptsUsed: 0,

      problemResults,
    });

    // --------------------------------------------------------
    // DEADLINE
    // --------------------------------------------------------

    const attemptDeadline = getAttemptDeadline(attempt, test);

    return res.status(201).json({
      success: true,

      message: "Test started successfully",

      attempt: {
        ...attempt.toObject(),

        deadline: attemptDeadline,

        duration: test.duration,
      },
    });
  } catch (error) {
    console.error("START TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to start test",

      error: error.message,
    });
  }
};

// ============================================================
// FINISH TEST
// ============================================================

export const finishTest = async (req, res) => {
  try {
    const { id: testId } = req.params;

    // --------------------------------------------------------
    // EXISTING SUBMISSION
    // --------------------------------------------------------

    const existingSubmission = await Submission.findOne({
      test: testId,

      user: req.user._id,
    });

    // --------------------------------------------------------
    // ALREADY SUBMITTED
    // --------------------------------------------------------

    if (existingSubmission?.status === "submitted") {
      return res.status(409).json({
        success: false,

        message: "You have already submitted this test",
      });
    }

    // --------------------------------------------------------
    // ACTIVE ATTEMPT
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // MUST HAVE AT LEAST ONE SUBMITTED PROBLEM
    // --------------------------------------------------------

    if (!existingSubmission) {
      return res.status(400).json({
        success: false,

        message: "No problem submission found",
      });
    }

    const submission = existingSubmission;

    // --------------------------------------------------------
    // FINALIZE SUBMISSION
    // --------------------------------------------------------

    submission.status = "submitted";

    submission.submittedAt = new Date();

    await submission.save();

    // --------------------------------------------------------
    // SAVE ACCEPTED PROBLEMS IN USER PROFILE
    // --------------------------------------------------------

    const solvedProblemIds = submission.problems
      .filter((item) => item.verdict === "Accepted")

      .map((item) => item.problem);

    if (solvedProblemIds.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          solvedProblems: {
            $each: solvedProblemIds,
          },
        },
      });
    }

    // --------------------------------------------------------
    // QUESTION COUNTS
    // --------------------------------------------------------

    const totalQuestions = attempt.problemResults.length;

    const attemptedQuestions = submission.problems.length;

    const solvedQuestions = solvedProblemIds.length;

    const unsolvedQuestions = Math.max(totalQuestions - solvedQuestions, 0);

    // --------------------------------------------------------
    // RESPONSE RESULT
    // --------------------------------------------------------

    const result = {
      submissionId: submission._id,

      totalQuestions,

      attemptedQuestions,

      solvedQuestions,

      unsolvedQuestions,

      solvedProblems: solvedProblemIds,

      aiPromptsUsed: attempt.aiPromptsUsed || 0,

      submittedAt: submission.submittedAt,
    };

    // --------------------------------------------------------
    // DELETE TEMPORARY ATTEMPT
    // --------------------------------------------------------

    await TestAttempt.deleteOne({
      _id: attempt._id,
    });

    return res.status(200).json({
      success: true,

      message: "Test submitted successfully",

      result,
    });
  } catch (error) {
    console.error("FINISH TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to submit test",

      error: error.message,
    });
  }
};

// ============================================================
// GET TEST RESULTS
// TEACHER / ADMIN
// ============================================================

export const getTestResults = async (req, res) => {
  try {
    const { id: testId } = req.params;

    // --------------------------------------------------------
    // GET TEST
    // --------------------------------------------------------

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot view results for this test",
      });
    }

    // --------------------------------------------------------
    // FINAL SUBMISSIONS
    // --------------------------------------------------------

    const submissions = await Submission.find({
      test: testId,

      status: "submitted",
    })
      .populate("user", "name email branch year")

      .populate("problems.problem", "title slug difficulty topic")

      .sort({
        submittedAt: 1,
      });

    // --------------------------------------------------------
    // TOTAL QUESTIONS
    // --------------------------------------------------------

    const totalProblems = test.problems.length;

    // --------------------------------------------------------
    // FORMAT RESULTS
    // --------------------------------------------------------

    const results = submissions.map((submission) => {
      const attemptedProblems = submission.problems.length;

      const solvedProblems = submission.problems.filter(
        (item) => item.verdict === "Accepted",
      ).length;

      const failedProblems = submission.problems.filter(
        (item) => item.verdict !== "Accepted",
      ).length;

      const notAttemptedProblems = Math.max(
        totalProblems - attemptedProblems,
        0,
      );

      return {
        submissionId: submission._id,

        student: submission.user,

        status: submission.status,

        submittedAt: submission.submittedAt,

        totalProblems,

        attemptedProblems,

        solvedProblems,

        failedProblems,

        notAttemptedProblems,

        problems: submission.problems,
      };
    });

    return res.status(200).json({
      success: true,

      test: {
        id: test._id,

        title: test.title,

        duration: test.duration,

        maxAIPrompts: test.maxAIPrompts,

        totalProblems,
      },

      totalStudents: results.length,

      results,
    });
  } catch (error) {
    console.error("GET TEST RESULTS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch test results",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE TEST
// ============================================================

export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // GET TEST
    // --------------------------------------------------------

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot update this test",
      });
    }

    // --------------------------------------------------------
    // ALLOWED FIELDS
    // --------------------------------------------------------

    const allowedFields = [
      "title",
      "description",
      "duration",
      "startTime",
      "endTime",
      "maxAIPrompts",
      "allowDirectAccess",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        test[field] = req.body[field];
      }
    });

    // --------------------------------------------------------
    // DURATION VALIDATION
    // --------------------------------------------------------

    const numericDuration = Number(test.duration);

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      return res.status(400).json({
        success: false,

        message: "Duration must be greater than 0",
      });
    }

    // --------------------------------------------------------
    // AI LIMIT VALIDATION
    // --------------------------------------------------------

    const numericMaxAIPrompts = Number(test.maxAIPrompts);

    if (
      !Number.isInteger(numericMaxAIPrompts) ||
      numericMaxAIPrompts < 0 ||
      numericMaxAIPrompts > 3
    ) {
      return res.status(400).json({
        success: false,

        message: "Maximum AI prompts must be between 0 and 3",
      });
    }

    // --------------------------------------------------------
    // TIME VALIDATION
    // --------------------------------------------------------

    const startTime = new Date(test.startTime);

    const endTime = new Date(test.endTime);

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      endTime <= startTime
    ) {
      return res.status(400).json({
        success: false,

        message: "End time must be after start time",
      });
    }

    test.duration = numericDuration;

    test.maxAIPrompts = numericMaxAIPrompts;

    await test.save();

    return res.status(200).json({
      success: true,

      message: "Test updated successfully",

      test,
    });
  } catch (error) {
    console.error("UPDATE TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update test",

      error: error.message,
    });
  }
};

// ============================================================
// ADD PROBLEM TO TEST
// ============================================================

export const addProblemToTest = async (req, res) => {
  try {
    const { id } = req.params;

    const { problemId } = req.body;

    // --------------------------------------------------------
    // VALIDATE PROBLEM ID
    // --------------------------------------------------------

    if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,

        message: "Valid problem ID is required",
      });
    }

    // --------------------------------------------------------
    // GET TEST
    // --------------------------------------------------------

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot modify this test",
      });
    }

    // --------------------------------------------------------
    // ONLY DRAFT
    // --------------------------------------------------------

    if (test.status !== "draft") {
      return res.status(400).json({
        success: false,

        message: "Problems can only be changed while test is in draft mode",
      });
    }

    // --------------------------------------------------------
    // GET PROBLEM
    // --------------------------------------------------------

    const problem = await Problem.findOne({
      _id: problemId,

      isActive: true,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,

        message: "Problem not found or inactive",
      });
    }

    // --------------------------------------------------------
    // DUPLICATE CHECK
    // --------------------------------------------------------

    const alreadyAdded = test.problems.some(
      (item) => String(item.problem) === String(problemId),
    );

    if (alreadyAdded) {
      return res.status(409).json({
        success: false,

        message: "Problem already added to test",
      });
    }

    // --------------------------------------------------------
    // ADD
    // --------------------------------------------------------

    test.problems.push({
      problem: problemId,
    });

    await test.save();

    return res.status(200).json({
      success: true,

      message: "Problem added successfully",

      problems: test.problems,
    });
  } catch (error) {
    console.error("ADD PROBLEM TO TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to add problem",

      error: error.message,
    });
  }
};

// ============================================================
// REMOVE PROBLEM FROM TEST
// ============================================================

export const removeProblemFromTest = async (req, res) => {
  try {
    const { id, problemId } = req.params;

    // ------------------------------------------------------
    // GET TEST
    // ------------------------------------------------------

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // ------------------------------------------------------
    // PERMISSION
    // ------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot modify this test",
      });
    }

    // ------------------------------------------------------
    // ONLY DRAFT
    // ------------------------------------------------------

    if (test.status !== "draft") {
      return res.status(400).json({
        success: false,

        message: "Problems can only be removed while test is in draft mode",
      });
    }

    // ------------------------------------------------------
    // REMOVE
    // ------------------------------------------------------

    const before = test.problems.length;

    test.problems = test.problems.filter(
      (item) => String(item.problem) !== String(problemId),
    );

    if (before === test.problems.length) {
      return res.status(404).json({
        success: false,

        message: "Problem not found in this test",
      });
    }

    await test.save();

    return res.status(200).json({
      success: true,

      message: "Problem removed successfully",

      problems: test.problems,
    });
  } catch (error) {
    console.error("REMOVE PROBLEM FROM TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to remove problem",

      error: error.message,
    });
  }
};

// ============================================================
// UNPUBLISH TEST
// ============================================================

export const unpublishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot unpublish this test",
      });
    }

    // --------------------------------------------------------
    // CHECK BOTH TEMP + PERMANENT ACTIVITY
    // --------------------------------------------------------

    const [attemptCount, submissionCount] = await Promise.all([
      TestAttempt.countDocuments({
        test: test._id,
      }),

      Submission.countDocuments({
        test: test._id,
      }),
    ]);

    if (attemptCount > 0 || submissionCount > 0) {
      return res.status(400).json({
        success: false,

        message:
          "Cannot unpublish because students have already started or submitted this test",
      });
    }

    // --------------------------------------------------------
    // UNPUBLISH
    // --------------------------------------------------------

    test.status = "draft";

    await test.save();

    return res.status(200).json({
      success: true,

      message: "Test moved back to draft",

      test,
    });
  } catch (error) {
    console.error("UNPUBLISH TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to unpublish test",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE TEST
// ============================================================

export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot delete this test",
      });
    }

    // --------------------------------------------------------
    // CHECK STUDENT ACTIVITY
    // --------------------------------------------------------

    const [attemptCount, submissionCount] = await Promise.all([
      TestAttempt.countDocuments({
        test: test._id,
      }),

      Submission.countDocuments({
        test: test._id,
      }),
    ]);

    if (attemptCount > 0 || submissionCount > 0) {
      return res.status(400).json({
        success: false,

        message: "Cannot delete test because student activity already exists",
      });
    }

    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    await Test.findByIdAndDelete(test._id);

    return res.status(200).json({
      success: true,

      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete test",

      error: error.message,
    });
  }
};

// ============================================================
// JOIN TEST
// ============================================================

export const joinTest = async (req, res) => {
  try {
    const { accessCode } = req.body || {};

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!accessCode?.trim()) {
      return res.status(400).json({
        success: false,

        message: "Access code is required",
      });
    }

    const normalizedCode = accessCode.trim().toUpperCase();

    // --------------------------------------------------------
    // FIND TEST
    // --------------------------------------------------------

    const test = await Test.findOne({
      accessCode: normalizedCode,

      status: "published",

      isActive: true,
    }).populate("problems.problem", "title difficulty topic");

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Invalid or unavailable test code",
      });
    }

    // --------------------------------------------------------
    // ALREADY SUBMITTED
    // --------------------------------------------------------

    const alreadySubmitted = await Submission.exists({
      user: req.user._id,

      test: test._id,

      status: "submitted",
    });

    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,

        message: "You have already submitted this test",
      });
    }

    // --------------------------------------------------------
    // TIME STATUS
    // --------------------------------------------------------

    const now = new Date();

    const startTime = new Date(test.startTime);

    const endTime = new Date(test.endTime);

    if (now.getTime() > endTime.getTime()) {
      return res.status(400).json({
        success: false,

        message: "This test has already ended",
      });
    }

    // --------------------------------------------------------
    // EXISTING ATTEMPT
    // --------------------------------------------------------

    const existingAttempt = await TestAttempt.findOne({
      test: test._id,

      student: req.user._id,
    });

    let testStatus = "upcoming";

    if (
      now.getTime() >= startTime.getTime() &&
      now.getTime() <= endTime.getTime()
    ) {
      testStatus = "live";
    }

    return res.status(200).json({
      success: true,

      message: "Test found successfully",

      test: {
        id: test._id,

        _id: test._id,

        title: test.title,

        description: test.description,

        duration: test.duration,

        startTime: test.startTime,

        endTime: test.endTime,

        totalProblems: test.problems.length,

        maxAIPrompts: test.maxAIPrompts,

        status: testStatus,
      },

      attempt: existingAttempt
        ? {
            id: existingAttempt._id,

            status: existingAttempt.status,
          }
        : null,
    });
  } catch (error) {
    console.error("JOIN TEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to join test",

      error: error.message,
    });
  }
};

// ============================================================
// GET TEST PARTICIPANTS
// TEACHER / ADMIN
// ============================================================

export const getTestParticipants = async (req, res) => {
  try {
    const { id: testId } = req.params;

    // ------------------------------------------------------
    // GET TEST
    // ------------------------------------------------------

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,

        message: "Test not found",
      });
    }

    // ------------------------------------------------------
    // PERMISSION
    // ------------------------------------------------------

    if (!isTestOwnerOrAdmin(test, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot view participants for this test",
      });
    }

    // ------------------------------------------------------
    // TEMP ATTEMPTS + PERMANENT SUBMISSIONS
    // ------------------------------------------------------

    const [attempts, submissions] = await Promise.all([
      TestAttempt.find({
        test: testId,
      })
        .populate("student", "name email branch year")

        .sort({
          startedAt: -1,
        }),

      Submission.find({
        test: testId,

        status: "submitted",
      })
        .populate("user", "name email branch year")

        .populate("problems.problem", "title difficulty topic")

        .sort({
          submittedAt: -1,
        }),
    ]);

    const totalProblems = test.problems.length;

    const participantMap = new Map();

    // ------------------------------------------------------
    // ACTIVE / TEMP ATTEMPTS
    // ------------------------------------------------------

    attempts.forEach((attempt) => {
      if (!attempt.student) {
        return;
      }

      const studentId = attempt.student._id.toString();

      const passedProblems = attempt.problemResults.filter(
        (item) => item.status === "passed",
      ).length;

      const failedProblems = attempt.problemResults.filter(
        (item) => item.status === "failed",
      ).length;

      const attemptedProblems = attempt.problemResults.filter(
        (item) => item.status !== "not_attempted",
      ).length;

      participantMap.set(studentId, {
        student: attempt.student,

        attemptId: attempt._id,

        submissionId: null,

        status: attempt.status,

        startedAt: attempt.startedAt,

        submittedAt: attempt.submittedAt,

        aiPromptsUsed: attempt.aiPromptsUsed || 0,

        passedProblems,

        failedProblems,

        attemptedProblems,

        notAttemptedProblems: Math.max(totalProblems - attemptedProblems, 0),

        totalProblems,
      });
    });

    // ------------------------------------------------------
    // FINAL SUBMISSIONS
    // ------------------------------------------------------

    submissions.forEach((submission) => {
      if (!submission.user) {
        return;
      }

      const studentId = submission.user._id.toString();

      const attemptedProblems = submission.problems.length;

      const passedProblems = submission.problems.filter(
        (item) => item.verdict === "Accepted",
      ).length;

      const failedProblems = submission.problems.filter(
        (item) => item.verdict !== "Accepted",
      ).length;

      const previous = participantMap.get(studentId);

      participantMap.set(studentId, {
        student: submission.user,

        attemptId: previous?.attemptId || null,

        submissionId: submission._id,

        status: "submitted",

        startedAt: previous?.startedAt || null,

        submittedAt: submission.submittedAt,

        aiPromptsUsed: previous?.aiPromptsUsed ?? null,

        passedProblems,

        failedProblems,

        attemptedProblems,

        notAttemptedProblems: Math.max(totalProblems - attemptedProblems, 0),

        totalProblems,
      });
    });

    // ------------------------------------------------------
    // FINAL PARTICIPANTS
    // ------------------------------------------------------

    const participants = Array.from(participantMap.values());

    // ------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------

    const summary = {
      totalParticipants: participants.length,

      inProgress: participants.filter((item) => item.status === "in_progress")
        .length,

      submitted: participants.filter((item) => item.status === "submitted")
        .length,

      expired: participants.filter((item) => item.status === "expired").length,
    };

    return res.status(200).json({
      success: true,

      test: {
        id: test._id,

        title: test.title,

        status: test.status,

        totalProblems,
      },

      summary,

      participants,
    });
  } catch (error) {
    console.error("GET TEST PARTICIPANTS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch test participants",

      error: error.message,
    });
  }
};
