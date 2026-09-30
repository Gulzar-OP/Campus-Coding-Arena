import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";

// GET STUDENT DASHBOARD
export const getStudentDashboard = async (req, res) => {
  try {
    const now = new Date();

    const tests = await Test.find({
      status: "published",
      isActive: true,
    })
      .populate("problems.problem", "title difficulty topic")
      .sort({
        startTime: 1,
      });

    const attempts = await TestAttempt.find({
      student: req.user._id,
    });

    const attemptMap = new Map();

    attempts.forEach((attempt) => {
      attemptMap.set(attempt.test.toString(), attempt);
    });

    const dashboardTests = tests.map((test) => {
      const attempt = attemptMap.get(test._id.toString());

      let testStatus;

      if (now < test.startTime) {
        testStatus = "upcoming";
      } else if (now > test.endTime) {
        testStatus = "completed";
      } else {
        testStatus = "live";
      }

      let attemptStatus = "not_started";

      if (attempt) {
        attemptStatus = attempt.status;
      }

      return {
        id: test._id,
        title: test.title,
        description: test.description,

        duration: test.duration,

        startTime: test.startTime,

        endTime: test.endTime,

        testStatus,

        attemptStatus,

        totalProblems: test.problems.length,

        maxAIPrompts: test.maxAIPrompts,

        aiPromptsUsed: attempt?.aiPromptsUsed || 0,

        totalMarks: attempt?.totalMarks || 0,
      };
    });

    const live = dashboardTests.filter((test) => test.testStatus === "live");

    const upcoming = dashboardTests.filter(
      (test) => test.testStatus === "upcoming",
    );

    const completed = dashboardTests.filter(
      (test) =>
        test.testStatus === "completed" || test.attemptStatus === "submitted",
    );

    return res.status(200).json({
      success: true,

      summary: {
        liveTests: live.length,

        upcomingTests: upcoming.length,

        completedTests: completed.length,

        totalAttempts: attempts.length,
      },

      live,

      upcoming,

      completed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard",
      error: error.message,
    });
  }
};

// GET MY TEST RESULTS
export const getMyResults = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({
      student: req.user._id,

      status: {
        $in: ["submitted", "expired"],
      },
    })
      .populate("test", "title description duration startTime endTime")
      .populate("problemResults.problem", "title difficulty topic")
      .populate(
        "problemResults.submission",
        "language verdict passedTestCases totalTestCases executionTime memoryUsed",
      )
      .sort({
        createdAt: -1,
      });

    const results = attempts.map((attempt) => ({
      attemptId: attempt._id,

      test: attempt.test,

      status: attempt.status,

      startedAt: attempt.startedAt,

      submittedAt: attempt.submittedAt,

      aiPromptsUsed: attempt.aiPromptsUsed,

      totalMarks: attempt.totalMarks,

      problems: attempt.problemResults,
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};
// GET RESULT BY TEST
// GET /api/student/results/:testId
export const getResultByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId).populate(
      "problems.problem",
      "title slug topic difficulty",
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }
    // FIND STUDENT ATTEMPT

    const attempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id,
    })
      .populate("problemResults.problem", "title slug topic difficulty")
      .populate("problemResults.submission");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    // TEST MUST BE SUBMITTED

    if (attempt.status === "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Test is still in progress",
      });
    }

    // BUILD RESULT

    const results = attempt.problemResults.map((result) => {
      // Problem may have been deleted
      if (!result.problem) {
        return {
          problem: null,
          problemId: null,
          title: "Problem unavailable",
          status: result.status,
          marksObtained: result.marksObtained || 0,
          submission: result.submission || null,
        };
      }

      const testProblem = test.problems.find((item) => {
        if (!item.problem) {
          return false;
        }

        return String(item.problem._id) === String(result.problem._id);
      });

      return {
        problem: result.problem,
        problemId: result.problem._id,
        title: result.problem.title,
        difficulty: result.problem.difficulty,
        topic: result.problem.topic,
        status: result.status,
        marksObtained: result.marksObtained || 0,
        totalMarks: testProblem?.marks || 0,
        submission: result.submission || null,
      };
    });

    const maximumMarks = test.problems.reduce(
      (total, item) => total + Number(item.marks || 0),
      0,
    );

    const obtainedMarks = attempt.problemResults.reduce(
      (total, result) => total + Number(result.marksObtained || 0),
      0,
    );

    return res.status(200).json({
      success: true,

      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration,
      },

      attempt: {
        _id: attempt._id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        aiPromptsUsed: attempt.aiPromptsUsed,
        totalMarks: obtainedMarks,
        maximumMarks,
      },

      results,
    });
  } catch (error) {
    console.error("Get result by test error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch test result",
      error: error.message,
    });
  }
};
