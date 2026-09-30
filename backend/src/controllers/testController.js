import Test from "../models/test.js";
import Problem from "../models/Problem.js";
import TestAttempt from "../models/testAttempt.js";
import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";
import generateAccessCode from "../utils/generateAccessCode.js";
// ==============================
// CREATE TEST
// ==============================

// export const createTest = async (
//   req,
//   res,
// ) => {
//   try {
//     const {
//       title,
//       description,
//       problems,
//       duration,
//       startTime,
//       endTime,
//       maxAIPrompts = 3,
//     } = req.body;

//     if (
//       !title ||
//       !duration ||
//       !startTime ||
//       !endTime
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Title, duration, startTime and endTime are required",
//       });
//     }

//     const start = new Date(startTime);
//     const end = new Date(endTime);

//     if (
//       Number.isNaN(start.getTime()) ||
//       Number.isNaN(end.getTime())
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid start or end time",
//       });
//     }

//     if (end <= start) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "End time must be after start time",
//       });
//     }

//     if (
//       maxAIPrompts < 0 ||
//       maxAIPrompts > 3
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Maximum AI prompts allowed is 3",
//       });
//     }

//     // Validate problems
//     if (
//       problems &&
//       problems.length > 0
//     ) {
//       const problemIds =
//         problems.map(
//           (item) =>
//             item.problem,
//         );

//       const foundProblems =
//         await Problem.find({
//           _id: {
//             $in: problemIds,
//           },
//         });

//       if (
//         foundProblems.length !==
//         problemIds.length
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "One or more problems are invalid",
//         });
//       }
//     }
//     let accessCode;
//     let exists = true;

//     while (exists) {
//     accessCode =
//         generateAccessCode();

//     exists =
//         await Test.exists({
//         accessCode,
//         });
//     }

// const test = await Test.create({
//   title,
//   description,
//   problems,
//   duration,
//   startTime: start,
//   endTime: end,
//   maxAIPrompts,

//   accessCode,

//   createdBy:
//     req.user._id,
// });

//     return res.status(201).json({
//       success: true,
//       message:
//         "Test created successfully",
//       test,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to create test",
//       error:
//         error.message,
//     });
//   }
// };

export const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      startTime,
      endTime,
      problems = [],
      maxAIPrompts = 3,
      allowDirectAccess = false,
    } = req.body;

    if (!title || !duration || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, duration, start time and end time are required",
      });
    }

    const start = new Date(startTime);

    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Validate selected problems
    if (problems.length > 0) {
      const problemIds = problems.map((item) => item.problem);

      const existingProblems = await Problem.countDocuments({
        _id: {
          $in: problemIds,
        },
        isActive: true,
      });

      if (existingProblems !== problemIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more selected problems are invalid",
        });
      }
    }
    let accessCode;
    let exists = true;

    while (exists) {
    accessCode =
        generateAccessCode();

    exists =
        await Test.exists({
        accessCode,
        });
    }

    const test = await Test.create({
      title,
      description,
      duration,
      startTime,
      endTime,
      problems,
      maxAIPrompts,
      allowDirectAccess,
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
    return res.status(500).json({
      success: false,
      message: "Failed to create test",
      error: error.message,
    });
  }
};

// ==============================
// GET ALL TESTS
// ==============================

export const getAllTests = async (req, res) => {
  try {
    const filter = {
      isActive: true,
    };

    // students only published tests dekhenge
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
      error: error.message,
    });
  }
};

// ==============================
// GET SINGLE TEST
// ==============================

export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate(
        "problems.problem",
        "title slug difficulty topic description inputFormat outputFormat constraints tags testCases timeLimit memoryLimit languages",
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
};

// ==============================
// PUBLISH TEST
// ==============================

export const publishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot publish this test",
      });
    }

    if (!test.problems.length) {
      return res.status(400).json({
        success: false,
        message: "Add at least one problem before publishing",
      });
    }

    test.status = "published";

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Test published successfully",
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to publish test",
      error: error.message,
    });
  }
};

// ==============================
// START TEST
// ==============================

export const startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

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
    const now = new Date();

    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);

    // console.log("NOW:", now);
    // console.log("START:", startTime);
    // console.log("END:", endTime);
    // console.log("NOW < START:", now < startTime);
    // console.log("NOW > END:", now > endTime);
    // const now = new Date();

    if (now < test.startTime) {
      return res.status(400).json({
        success: false,
        message: "Test has not started yet",
      });
    }

    if (now > test.endTime) {
      return res.status(400).json({
        success: false,
        message: "Test has already ended",
      });
    }

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
    const problemResults = test.problems.map((item) => ({
      problem: item.problem,
      status: "not_attempted",
      marksObtained: 0,
    }));

    const attempt = await TestAttempt.create({
      test: test._id,
      student: req.user._id,
      startedAt: new Date(),
      status: "in_progress",
      aiPromptsUsed: 0,
      problemResults,
      totalMarks: 0,
    });
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
    return res.status(500).json({
      success: false,
      message: "Failed to start test",
      error: error.message,
    });
  }
};

export const finishTest = async (req, res) => {
  try {
    const { id: testId } = req.params;

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

    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    const totalMarks = attempt.problemResults.reduce(
      (sum, item) => sum + (item.marksObtained || 0),
      0,
    );

    attempt.totalMarks = totalMarks;

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      result: {
        attemptId: attempt._id,
        totalMarks: attempt.totalMarks,
        aiPromptsUsed: attempt.aiPromptsUsed,
        problemResults: attempt.problemResults,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit test",
      error: error.message,
    });
  }
};

export const getTestResults = async (req, res) => {
  try {
    const { id: testId } = req.params;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot view results for this test",
      });
    }

    const attempts = await TestAttempt.find({
      test: testId,
    })
      .populate("student", "name email branch year")
      .populate("problemResults.problem", "title difficulty topic")
      .populate(
        "problemResults.submission",
        "language verdict passedTestCases totalTestCases executionTime memoryUsed",
      )
      .sort({
        totalMarks: -1,
        submittedAt: 1,
      });

    const results = attempts.map((attempt) => ({
      attemptId: attempt._id,

      student: attempt.student,

      status: attempt.status,

      startedAt: attempt.startedAt,

      submittedAt: attempt.submittedAt,

      aiPromptsUsed: attempt.aiPromptsUsed,

      totalMarks: attempt.totalMarks,

      problems: attempt.problemResults.map((item) => ({
        problem: item.problem,

        status: item.status,

        marksObtained: item.marksObtained,

        submission: item.submission,
      })),
    }));

    return res.status(200).json({
      success: true,

      test: {
        id: test._id,
        title: test.title,
        duration: test.duration,
        maxAIPrompts: test.maxAIPrompts,
      },

      totalStudents: results.length,

      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test results",
      error: error.message,
    });
  }
};

// ==============================
// UPDATE TEST
// ==============================

export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this test",
      });
    }

    // published/completed test ko freely modify mat karo
    if (test.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed test cannot be modified",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "duration",
      "startTime",
      "endTime",
      "maxAIPrompts",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        test[field] = req.body[field];
      }
    });

    if (test.maxAIPrompts > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum AI prompts allowed is 3",
      });
    }

    if (new Date(test.endTime) <= new Date(test.startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update test",
      error: error.message,
    });
  }
};

// ==============================
// ADD PROBLEM TO TEST
// ==============================

export const addProblemToTest = async (req, res) => {
  try {
    const { id } = req.params;

    const { problemId, marks = 10 } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required",
      });
    }

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this test",
      });
    }

    if (test.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Problems can only be changed while test is in draft mode",
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
      (item) => item.problem.toString() === problemId,
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

    return res.status(200).json({
      success: true,
      message: "Problem added successfully",
      problems: test.problems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add problem",
      error: error.message,
    });
  }
};

// ==============================
// REMOVE PROBLEM FROM TEST
// ==============================

export const removeProblemFromTest = async (req, res) => {
  try {
    const { id, problemId } = req.params;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this test",
      });
    }

    if (test.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Problems can only be removed while test is in draft mode",
      });
    }

    const before = test.problems.length;

    test.problems = test.problems.filter(
      (item) => item.problem.toString() !== problemId,
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
    return res.status(500).json({
      success: false,
      message: "Failed to remove problem",
      error: error.message,
    });
  }
};

// ==============================
// UNPUBLISH TEST
// ==============================

export const unpublishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot unpublish this test",
      });
    }

    const attempts = await TestAttempt.countDocuments({
      test: test._id,
    });

    if (attempts > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot unpublish because students have already started this test",
      });
    }

    test.status = "draft";

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Test moved back to draft",
      test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unpublish test",
      error: error.message,
    });
  }
};

// ==============================
// DELETE TEST
// ==============================

export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const isOwner = test.createdBy.toString() === req.user._id.toString();

    const isTeacher = req.user.role === "teacher";

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this test",
      });
    }

    const attemptCount = await TestAttempt.countDocuments({
      test: test._id,
    });

    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete test because student attempts already exist",
      });
    }

    await Test.findByIdAndDelete(test._id);

    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete test",
      error: error.message,
    });
  }
};

export const joinTest = async (req, res) => {
  try {
    const { accessCode } = req.body || {};

    if (!accessCode) {
      return res.status(400).json({
        success: false,
        message: "Access code is required",
      });
    }

    const normalizedCode = accessCode.trim().toUpperCase();

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

    const now = new Date();

    const startTime = new Date(test.startTime);

    const endTime = new Date(test.endTime);

    // Test already finished
    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: "This test has already ended",
      });
    }

    // Check whether student already has an attempt
    const existingAttempt = await TestAttempt.findOne({
      test: test._id,
      student: req.user._id,
    });

    let testStatus = "upcoming";

    if (now >= startTime && now <= endTime) {
      testStatus = "live";
    }

    return res.status(200).json({
      success: true,

      message: "Test found successfully",

      test: {
        id: test._id,

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

export const getTestParticipants = async (req, res) => {
  try {
    const { id: testId } = req.params;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (
      test.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot view participants for this test",
      });
    }

    const attempts = await TestAttempt.find({
      test: testId,
    })
      .populate("student", "name email branch year")
      .sort({
        startedAt: -1,
      });

    const participants = attempts.map((attempt) => ({
      attemptId: attempt._id,

      student: attempt.student,

      status: attempt.status,

      startedAt: attempt.startedAt,

      submittedAt: attempt.submittedAt,

      aiPromptsUsed: attempt.aiPromptsUsed,

      totalMarks: attempt.totalMarks,

      passedProblems: attempt.problemResults.filter(
        (item) => item.status === "passed",
      ).length,

      failedProblems: attempt.problemResults.filter(
        (item) => item.status === "failed",
      ).length,

      attemptedProblems: attempt.problemResults.filter(
        (item) => item.status !== "not_attempted",
      ).length,

      totalProblems: attempt.problemResults.length,
    }));

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
      },

      summary,

      participants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test participants",
      error: error.message,
    });
  }
};
