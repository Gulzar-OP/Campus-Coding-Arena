import Submission from "../models/submission.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import User from "../models/User.js";

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
    // Temporary attempts
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
    // Build attempt map
    // testId -> attempt
    // --------------------------------------------------------

    const attemptMap = new Map();

    attempts.forEach((attempt) => {
      attemptMap.set(attempt.test.toString(), attempt);
    });

    // --------------------------------------------------------
    // Build submission map
    // testId -> submission
    // --------------------------------------------------------

    const submissionMap = new Map();

    submissions.forEach((submission) => {
      submissionMap.set(submission.test.toString(), submission);
    });

    // --------------------------------------------------------
    // Build dashboard data
    // --------------------------------------------------------

    const dashboardTests = tests.map((test) => {
      const testId = test._id.toString();

      const attempt = attemptMap.get(testId);

      const submission = submissionMap.get(testId);

      // ------------------------------------------------------
      // Test lifecycle status
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
      // Student-specific attempt status
      // ------------------------------------------------------

      let attemptStatus = "not_started";

      if (submission) {
        attemptStatus = "submitted";
      } else if (attempt) {
        attemptStatus = attempt.status;
      }

      // ------------------------------------------------------
      // Question stats
      // ------------------------------------------------------

      const totalProblems = test.problems.length;

      const attemptedProblems = submission
        ? submission.problems?.length || 0
        : attempt
          ? attempt.problemResults.filter(
              (item) => item.status !== "not_attempted",
            ).length
          : 0;

      const solvedProblems = submission
        ? submission.problems?.filter((item) => item.verdict === "Accepted")
            .length || 0
        : attempt
          ? attempt.problemResults.filter((item) => item.status === "passed")
              .length
          : 0;

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

        totalProblems,

        attemptedProblems,

        solvedProblems,

        unsolvedProblems: Math.max(totalProblems - solvedProblems, 0),

        maxAIPrompts: test.maxAIPrompts,

        aiPromptsUsed: attempt?.aiPromptsUsed || 0,

        submittedAt: submission?.submittedAt || null,
      };
    });

    // --------------------------------------------------------
    // Live tests
    // --------------------------------------------------------

    const live = dashboardTests.filter(
      (test) =>
        test.testStatus === "live" && test.attemptStatus !== "submitted",
    );

    // --------------------------------------------------------
    // Upcoming tests
    // --------------------------------------------------------

    const upcoming = dashboardTests.filter(
      (test) =>
        test.testStatus === "upcoming" && test.attemptStatus !== "submitted",
    );

    // --------------------------------------------------------
    // Completed tests
    // Only actually submitted tests
    // --------------------------------------------------------

    const completed = dashboardTests.filter(
      (test) => test.attemptStatus === "submitted",
    );

    // --------------------------------------------------------
    // Missed tests
    // Test ended but user never submitted
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
    // --------------------------------------------------------
    // Permanent submissions only
    // TestAttempt finish ke baad delete ho jata hai
    // --------------------------------------------------------

    const submissions = await Submission.find({
      user: req.user._id,
      status: "submitted",
    })
      .populate("test", "title description duration startTime endTime problems")
      .populate("problems.problem", "title difficulty topic")
      .sort({
        submittedAt: -1,
        updatedAt: -1,
      });
      
    const results = submissions.map((submission) => {
      const totalProblems = submission.test?.problems?.length || 0;

      const attemptedProblems = submission.problems?.length || 0;

      const solvedProblems =
        submission.problems?.filter((item) => item.verdict === "Accepted")
          .length || 0;

      return {
        submissionId: submission._id,

        test: submission.test,

        status: submission.status,

        totalProblems,

        attemptedProblems,

        solvedProblems,

        unsolvedProblems: Math.max(totalProblems - solvedProblems, 0),

        submittedAt: submission.submittedAt || submission.updatedAt,

        problems: submission.problems || [],
      };
    });

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
    // GET TEST
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
    // GET PERMANENT SUBMISSION
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
    // Build submitted problem map
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
    // Build result for every test problem
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

          submitted: Boolean(submittedProblem),

          verdict: submittedProblem?.verdict || "Not Attempted",

          passedTestCases: submittedProblem?.passedTestCases || 0,

          totalTestCases: submittedProblem?.totalTestCases || 0,

          language: submittedProblem?.language || null,

          executionTime: submittedProblem?.executionTime ?? null,

          memory: submittedProblem?.memory ?? null,

          submittedAt: submittedProblem?.submittedAt || null,
        };
      })
      .filter(Boolean);

    // --------------------------------------------------------
    // Question statistics
    // --------------------------------------------------------

    const totalProblems = test.problems.length;

    const attemptedProblems = submission.problems.length;

    const solvedProblems = submission.problems.filter(
      (item) => item.verdict === "Accepted",
    ).length;

    const failedProblems = submission.problems.filter(
      (item) => item.verdict !== "Accepted",
    ).length;

    const notAttemptedProblems = Math.max(totalProblems - attemptedProblems, 0);

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      test: {
        _id: test._id,

        title: test.title,

        description: test.description,

        duration: test.duration,

        totalProblems,
      },

      submission: {
        _id: submission._id,

        status: submission.status,

        attemptedProblems,

        solvedProblems,

        failedProblems,

        notAttemptedProblems,

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
// TEACHER SIDE
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
    // Get permanent submitted tests
    // --------------------------------------------------------

    const submissions = await Submission.find({
      user: {
        $in: studentIds,
      },

      status: "submitted",
    })
      .select("user test problems submittedAt")
      .lean();

    // --------------------------------------------------------
    // Stats map
    // --------------------------------------------------------

    const statsMap = new Map();

    submissions.forEach((submission) => {
      const userId = submission.user.toString();

      if (!statsMap.has(userId)) {
        statsMap.set(userId, {
          testsAttempted: 0,

          totalQuestionsAttempted: 0,

          totalQuestionsSolved: 0,
        });
      }

      const stats = statsMap.get(userId);

      stats.testsAttempted += 1;

      stats.totalQuestionsAttempted += submission.problems?.length || 0;

      stats.totalQuestionsSolved +=
        submission.problems?.filter((item) => item.verdict === "Accepted")
          .length || 0;
    });

    // --------------------------------------------------------
    // Combine student + stats
    // --------------------------------------------------------

    const studentsWithStats = students.map((student) => {
      const stats = statsMap.get(student._id.toString()) || {
        testsAttempted: 0,

        totalQuestionsAttempted: 0,

        totalQuestionsSolved: 0,
      };

      const solveRate =
        stats.totalQuestionsAttempted > 0
          ? Number(
              (
                (stats.totalQuestionsSolved / stats.totalQuestionsAttempted) *
                100
              ).toFixed(2),
            )
          : 0;

      return {
        ...student,

        stats: {
          solvedProblems: student.solvedProblems?.length || 0,

          testsAttempted: stats.testsAttempted,

          totalQuestionsAttempted: stats.totalQuestionsAttempted,

          totalQuestionsSolved: stats.totalQuestionsSolved,

          solveRate,
        },
      };
    });

    // --------------------------------------------------------
    // Pagination
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
