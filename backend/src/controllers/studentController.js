import Submission from "../models/submission.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import User from "../models/user.js";

// GET STUDENT DASHBOARD
// GET STUDENT DASHBOARD
export const getStudentDashboard = async (req, res) => {
  try {
    const now = new Date();

    // =====================================================
    // GET ALL PUBLISHED TESTS
    // =====================================================

    const tests = await Test.find({
      status: "published",
      isActive: true,
    })
      .populate(
        "problems.problem",
        "title difficulty topic",
      )
      .sort({
        startTime: 1,
      });

    // =====================================================
    // GET ACTIVE / TEMPORARY ATTEMPTS
    // =====================================================

    const attempts = await TestAttempt.find({
      student: req.user._id,
    });

    // =====================================================
    // GET FINAL SUBMISSIONS
    // =====================================================

    const submissions = await Submission.find({
      user: req.user._id,
      status: "submitted",
    });

    // =====================================================
    // ATTEMPT MAP
    // =====================================================

    const attemptMap = new Map();

    attempts.forEach((attempt) => {
      attemptMap.set(
        attempt.test.toString(),
        attempt,
      );
    });

    // =====================================================
    // SUBMISSION MAP
    // =====================================================

    const submissionMap = new Map();

    submissions.forEach((submission) => {
      submissionMap.set(
        submission.test.toString(),
        submission,
      );
    });

    // =====================================================
    // BUILD DASHBOARD TESTS
    // =====================================================

    const dashboardTests = tests.map((test) => {
      const testId =
        test._id.toString();

      const attempt =
        attemptMap.get(testId);

      const submission =
        submissionMap.get(testId);

      // ===================================================
      // TEST STATUS
      // ===================================================

      let testStatus;

      if (
        now <
        new Date(test.startTime)
      ) {
        testStatus =
          "upcoming";
      } else if (
        now >
        new Date(test.endTime)
      ) {
        testStatus =
          "completed";
      } else {
        testStatus =
          "live";
      }

      // ===================================================
      // STUDENT STATUS
      // ===================================================

      let attemptStatus =
        "not_started";

      if (submission) {
        attemptStatus =
          "submitted";
      } else if (attempt) {
        attemptStatus =
          attempt.status;
      }

      return {
        id: test._id,

        title:
          test.title,

        description:
          test.description,

        duration:
          test.duration,

        startTime:
          test.startTime,

        endTime:
          test.endTime,

        testStatus,

        attemptStatus,

        totalProblems:
          test.problems.length,

        maxAIPrompts:
          test.maxAIPrompts,

        aiPromptsUsed:
          attempt?.aiPromptsUsed ||
          0,

        totalMarks:
          submission?.totalMarks ||
          0,

        submittedAt:
          submission?.submittedAt ||
          null,
      };
    });

    // =====================================================
    // LIVE
    // Submitted test ko live me mat dikhao
    // =====================================================

    const live =
      dashboardTests.filter(
        (test) =>
          test.testStatus ===
            "live" &&
          test.attemptStatus !==
            "submitted",
      );

    // =====================================================
    // UPCOMING
    // =====================================================

    const upcoming =
      dashboardTests.filter(
        (test) =>
          test.testStatus ===
            "upcoming" &&
          test.attemptStatus !==
            "submitted",
      );

    // =====================================================
    // COMPLETED
    // =====================================================

    const completed =
      dashboardTests.filter(
        (test) =>
          test.testStatus ===
            "completed" ||
          test.attemptStatus ===
            "submitted",
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      summary: {
        liveTests:
          live.length,

        upcomingTests:
          upcoming.length,

        completedTests:
          completed.length,

        totalAttempts:
          submissions.length,
      },

      live,

      upcoming,

      completed,
    });
  } catch (error) {
    console.error(
      "GET STUDENT DASHBOARD ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student dashboard",
      error:
        error.message,
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
      .populate(
        "test",
        "title description duration startTime endTime",
      )
      .sort({
        createdAt: -1,
      });

    const results = await Promise.all(
      attempts.map(async (attempt) => {
        const submissions =
          await Submission.find({
            student: req.user._id,
            test: attempt.test._id,
          })
            .populate(
              "problem",
              "title difficulty topic",
            )
            .select(
              "problem language verdict passedTestCases totalTestCases executionTime memoryUsed createdAt",
            );

        return {
          attemptId: attempt._id,

          test: attempt.test,

          status: attempt.status,

          startedAt: attempt.startedAt,

          submittedAt: attempt.submittedAt,

          aiPromptsUsed:
            attempt.aiPromptsUsed,

          submissions,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "GET MY RESULTS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch results",
      error: error.message,
    });
  }
};

export const getResultByTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId)
      .populate(
        "problems.problem",
        "title difficulty topic",
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const submissions =
      await Submission.find({
        test: testId,
        student: req.user._id,
      })
        .populate(
          "problem",
          "title difficulty topic",
        )
        .sort({
          createdAt: -1,
        });

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        message:
          "No submissions found for this test",
      });
    }

    // latest submission of each problem
    const submissionMap = new Map();

    submissions.forEach((submission) => {
      const problemId =
        submission.problem?._id?.toString() ||
        submission.problem?.toString();

      if (
        problemId &&
        !submissionMap.has(problemId)
      ) {
        submissionMap.set(
          problemId,
          submission,
        );
      }
    });

    const results = test.problems.map(
      (entry) => {
        const problem =
          entry.problem;

        const submission =
          submissionMap.get(
            problem._id.toString(),
          );

        return {
          problem: {
            _id: problem._id,
            title: problem.title,
            difficulty:
              problem.difficulty,
            topic: problem.topic,
          },

          submitted: !!submission,

          verdict:
            submission?.verdict ||
            "Not Attempted",

          passedTestCases:
            submission?.passedTestCases ||
            0,

          totalTestCases:
            submission?.totalTestCases ||
            0,

          language:
            submission?.language ||
            null,

          submittedAt:
            submission?.createdAt ||
            null,
        };
      },
    );

    return res.status(200).json({
      success: true,

      test: {
        _id: test._id,
        title: test.title,
      },

      results,
    });
  } catch (error) {
    console.error(
      "GET RESULT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load result",
    });
  }
};

export const allStudent = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const filter = {
      role: "student",
    };

    const totalStudents =
      await User.countDocuments(filter);

    const students = await User.find(filter)
      .select(
        "name email rollNo branch year solvedProblems createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const studentsWithStats =
      await Promise.all(
        students.map(async (student) => {
          const attempts =
            await TestAttempt.find({
              student: student._id,
              status: "submitted",
            }).select(
              "obtainedMarks",
            );

          const testsAttempted =
            attempts.length;

          const totalMarks =
            attempts.reduce(
              (sum, attempt) =>
                sum +
                (attempt.obtainedMarks || 0),
              0,
            );

          const averageMarks =
            testsAttempted > 0
              ? Number(
                  (
                    totalMarks /
                    testsAttempted
                  ).toFixed(2),
                )
              : 0;

          return {
            ...student.toObject(),

            stats: {
              solvedProblems:
                student
                  .solvedProblems
                  ?.length || 0,

              testsAttempted,

              totalMarks,

              averageMarks,
            },
          };
        }),
      );

    const totalPages =
      Math.ceil(
        totalStudents / limit,
      );

    return res.status(200).json({
      success: true,

      students:
        studentsWithStats,

      pagination: {
        currentPage: page,

        totalPages,

        totalStudents,

        limit,

        hasNextPage:
          page < totalPages,

        hasPrevPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get students error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch students",

      error: error.message,
    });
  }
};