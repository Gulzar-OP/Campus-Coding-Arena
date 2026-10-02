import Submission from "../models/submission.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import User from "../models/user.js";

// ============================================================
// STUDENT DASHBOARD
// ============================================================

export const getStudentDashboard = async (req, res) => {
  try {
    const now = new Date();

    // --------------------------------------------------------
    // Published and active tests
    // --------------------------------------------------------

    const tests = await Test.find({
      status: "published",
      isActive: true,
    })
      .populate("problems.problem", "title difficulty topic")
      .sort({
        startTime: 1,
      });

    // --------------------------------------------------------
    // Temporary active attempts
    // --------------------------------------------------------

    const attempts = await TestAttempt.find({
      student: req.user._id,
    });

    // --------------------------------------------------------
    // Permanent submitted tests
    // --------------------------------------------------------

    const submissions = await Submission.find({
      user: req.user._id,
      status: "submitted",
    });

    // --------------------------------------------------------
    // Attempt map
    // testId -> attempt
    // --------------------------------------------------------

    const attemptMap = new Map();

    attempts.forEach((attempt) => {
      attemptMap.set(attempt.test.toString(), attempt);
    });

    // --------------------------------------------------------
    // Submission map
    // testId -> submission
    // --------------------------------------------------------

    const submissionMap = new Map();

    submissions.forEach((submission) => {
      submissionMap.set(submission.test.toString(), submission);
    });

    // --------------------------------------------------------
    // Build student-specific test data
    // --------------------------------------------------------

    const dashboardTests = tests.map((test) => {
      const testId = test._id.toString();

      const attempt = attemptMap.get(testId);

      const submission = submissionMap.get(testId);

      // ------------------------------------------------------
      // Test availability status
      // ------------------------------------------------------

      let testStatus;

      const startTime = new Date(test.startTime);

      const endTime = new Date(test.endTime);

      if (now.getTime() < startTime.getTime()) {
        testStatus = "upcoming";
      } else if (now.getTime() > endTime.getTime()) {
        testStatus = "ended";
      } else {
        testStatus = "live";
      }

      // ------------------------------------------------------
      // Student attempt status
      // ------------------------------------------------------

      let attemptStatus = "not_started";

      if (submission) {
        attemptStatus = "submitted";
      } else if (attempt) {
        attemptStatus = attempt.status;
      }

      return {
        id: test._id,
        _id: test._id,
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
        totalMarks: submission?.totalMarks || 0,
        submittedAt: submission?.submittedAt || null,
      };
    });

    // --------------------------------------------------------
    // Live
    // Submitted test live me dobara nahi aayega
    // --------------------------------------------------------

    const live = dashboardTests.filter(
      (test) =>
        test.testStatus === "live" && test.attemptStatus !== "submitted",
    );

    // --------------------------------------------------------
    // Upcoming
    // --------------------------------------------------------

    const upcoming = dashboardTests.filter(
      (test) =>
        test.testStatus === "upcoming" && test.attemptStatus !== "submitted",
    );

    // --------------------------------------------------------
    // Completed
    // Only actual submitted tests
    // --------------------------------------------------------

    const completed = dashboardTests.filter(
      (test) => test.attemptStatus === "submitted",
    );

    // --------------------------------------------------------
    // Missed
    // Test ended but student never submitted
    // --------------------------------------------------------

    const missed = dashboardTests.filter(
      (test) =>
        test.testStatus === "ended" && test.attemptStatus !== "submitted",
    );

    return res.status(200).json({
      success: true,

      summary: {
        liveTests: live.length,

        upcomingTests: upcoming.length,

        completedTests: completed.length,

        missedTests: missed.length,

        totalSubmittedTests: submissions.length,
      },

      live,
      upcoming,
      completed,
      missed,
    });
  } catch (error) {
    console.error("GET STUDENT DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard",
      error: error.message,
    });
  }
};

// ============================================================
// GET MY TEST RESULTS
// ============================================================

export const getMyResults = async (req, res) => {
  try {
    // TestAttempt use nahi karenge because
    // finish hone ke baad attempt delete ho jata hai.

    const submissions = await Submission.find({
      user: req.user._id,
      status: "submitted",
    })
      .populate("test", "title description duration startTime endTime")
      .populate("problems.problem", "title difficulty topic")
      .sort({
        submittedAt: -1,
        updatedAt: -1,
      });

    const results = submissions.map((submission) => ({
      submissionId: submission._id,
      test: submission.test,
      status: submission.status,
      totalMarks: submission.totalMarks || 0,
      submittedAt: submission.submittedAt || submission.updatedAt,
      problems: submission.problems || [],
    }));

    return res.status(200).json({
      success: true,

      count: results.length,

      results,
    });
  } catch (error) {
    console.error("GET MY RESULTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

// ============================================================
// GET RESULT OF ONE TEST
// ============================================================

export const getResultByTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // --------------------------------------------------------
    // Get test
    // --------------------------------------------------------

    const test = await Test.findById(testId).populate(
      "problems.problem",
      "title difficulty topic",
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // --------------------------------------------------------
    // Get student's permanent submission
    // --------------------------------------------------------

    const submission = await Submission.findOne({
      test: testId,
      user: req.user._id,
      status: "submitted",
    }).populate("problems.problem", "title difficulty topic");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Result not found for this test",
      });
    }

    // --------------------------------------------------------
    // Create map
    // problemId -> submitted problem
    // --------------------------------------------------------

    const submittedProblemMap = new Map();

    submission.problems.forEach((item) => {
      const problemId =
        item.problem?._id?.toString() || item.problem?.toString();

      if (problemId) {
        submittedProblemMap.set(problemId, item);
      }
    });

    // --------------------------------------------------------
    // Build result for every problem in test
    // --------------------------------------------------------

    const results = test.problems
      .map((entry) => {
        const problem = entry.problem;

        if (!problem) {
          return null;
        }

        const submittedProblem = submittedProblemMap.get(
          problem._id.toString(),
        );

        return {
          problem: {
            _id: problem._id,

            title: problem.title,

            difficulty: problem.difficulty,

            topic: problem.topic,
          },

          maxMarks: Number(entry.marks || 0),
          submitted: Boolean(submittedProblem),
          verdict: submittedProblem?.verdict || "Not Attempted",
          passedTestCases: submittedProblem?.passedTestCases || 0,
          totalTestCases: submittedProblem?.totalTestCases || 0,
          language: submittedProblem?.language || null,
          marks: submittedProblem?.marks || 0,
          executionTime: submittedProblem?.executionTime ?? null,
          memory: submittedProblem?.memory ?? null,
          submittedAt: submittedProblem?.submittedAt || null,
        };
      })
      .filter(Boolean);

    // --------------------------------------------------------
    // Total maximum marks of test
    // --------------------------------------------------------

    const maximumMarks = test.problems.reduce(
      (total, entry) => total + Number(entry.marks || 0),
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

      submission: {
        _id: submission._id,
        status: submission.status,
        totalMarks: submission.totalMarks || 0,
        maximumMarks,
        submittedAt: submission.submittedAt || submission.updatedAt,
      },

      results,
    });
  } catch (error) {
    console.error("GET RESULT BY TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load result",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL STUDENTS
// Teacher side
// ============================================================

export const allStudent = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    // --------------------------------------------------------
    // Student filter
    // --------------------------------------------------------

    const filter = {
      role: "student",
    };

    // --------------------------------------------------------
    // Fetch students + count
    // --------------------------------------------------------

    const [totalStudents, students] = await Promise.all([
      User.countDocuments(filter),

      User.find(filter)
        .select("name email rollNo branch year solvedProblems createdAt")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // --------------------------------------------------------
    // Student IDs
    // --------------------------------------------------------

    const studentIds = students.map((student) => student._id);

    // --------------------------------------------------------
    // Get all submitted tests for current page students
    // --------------------------------------------------------

    const submissions = await Submission.find({
      user: {
        $in: studentIds,
      },

      status: "submitted",
    })
      .select("user totalMarks")
      .lean();

    // --------------------------------------------------------
    // Build stats map
    // Avoid one DB query per student
    // --------------------------------------------------------

    const statsMap = new Map();

    submissions.forEach((submission) => {
      const userId = submission.user.toString();

      if (!statsMap.has(userId)) {
        statsMap.set(userId, {
          testsAttempted: 0,

          totalMarks: 0,
        });
      }

      const stats = statsMap.get(userId);

      stats.testsAttempted += 1;

      stats.totalMarks += Number(submission.totalMarks || 0);
    });

    // --------------------------------------------------------
    // Combine student data + stats
    // --------------------------------------------------------

    const studentsWithStats = students.map((student) => {
      const stats = statsMap.get(student._id.toString()) || {
        testsAttempted: 0,

        totalMarks: 0,
      };

      const averageMarks =
        stats.testsAttempted > 0
          ? Number((stats.totalMarks / stats.testsAttempted).toFixed(2))
          : 0;

      return {
        ...student,

        stats: {
          solvedProblems: student.solvedProblems?.length || 0,
          testsAttempted: stats.testsAttempted,
          totalMarks: stats.totalMarks,
          averageMarks,
        },
      };
    });

    // --------------------------------------------------------
    // Pagination response
    // --------------------------------------------------------

    const totalPages = Math.ceil(totalStudents / limit);

    return res.status(200).json({
      success: true,
      students: studentsWithStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET ALL STUDENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};
