import Problem from "../models/Problem.js";
import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import Submission from "../models/submission.js";
import User from "../models/user.js";

// ============================================================
// TEACHER DASHBOARD
// GET /api/teacher/dashboard
// ============================================================

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const now = new Date();

    // ========================================================
    // BASIC COUNTS
    // ========================================================
    const teacherTestIds = await Test.find({
      createdBy: teacherId,
      isActive: true,
    }).distinct("_id");

    const [totalProblems, totalTests, totalStudents, totalSubmissions] =
      await Promise.all([
        // Problems created by this teacher
        Problem.countDocuments({
          createdBy: teacherId,
          isActive: true,
        }),

        // Tests created by this teacher
        Test.countDocuments({
          createdBy: teacherId,
          isActive: true,
        }),

        // Active students
        User.countDocuments({
          role: "student",
          isActive: true,
        }),

        // Final test submissions for teacher's tests
        Submission.countDocuments({
          test: {
            $in: teacherTestIds,
          },
          status: "submitted",
        }),
      ]);

    // ========================================================
    // RECENT TESTS
    // ========================================================

    const recentTestDocs = await Test.find({
      createdBy: teacherId,
      isActive: true,
    })
      .select(
        "title duration status problems startTime endTime createdAt accessCode",
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    const recentTestIds = recentTestDocs.map((test) => test._id);

    // ========================================================
    // ACTIVE ATTEMPTS FOR RECENT TESTS
    // ========================================================

    const recentAttempts = recentTestIds.length
      ? await TestAttempt.find({
          test: {
            $in: recentTestIds,
          },
        })
          .select("test student")
          .lean()
      : [];

    // ========================================================
    // FINAL SUBMISSIONS FOR RECENT TESTS
    // ========================================================

    const recentSubmissions = recentTestIds.length
      ? await Submission.find({
          test: {
            $in: recentTestIds,
          },

          status: "submitted",
        })
          .select("test user")
          .lean()
      : [];

    // ========================================================
    // BUILD RECENT TEST STATS
    // ========================================================

    const recentTests = recentTestDocs.map((test) => {
      const testId = test._id.toString();

      // --------------------------------------------------
      // Unique participants
      // --------------------------------------------------

      const participantIds = new Set();

      recentAttempts.forEach((attempt) => {
        if (attempt.test.toString() === testId) {
          participantIds.add(attempt.student.toString());
        }
      });

      recentSubmissions.forEach((submission) => {
        if (submission.test.toString() === testId) {
          participantIds.add(submission.user.toString());
        }
      });

      // --------------------------------------------------
      // Submitted count
      // --------------------------------------------------

      const submitted = recentSubmissions.filter(
        (submission) => submission.test.toString() === testId,
      ).length;

      // --------------------------------------------------
      // Runtime status
      // --------------------------------------------------

      let runtimeStatus = test.status;

      if (test.status === "published") {
        const start = new Date(test.startTime);

        const end = new Date(test.endTime);

        if (now < start) {
          runtimeStatus = "upcoming";
        } else if (now > end) {
          runtimeStatus = "ended";
        } else {
          runtimeStatus = "live";
        }
      }

      return {
        _id: test._id,

        title: test.title,

        duration: test.duration,

        problems: test.problems.length,

        participants: participantIds.size,

        submitted,

        status: test.status,

        runtimeStatus,

        startTime: test.startTime,

        endTime: test.endTime,

        accessCode: test.accessCode,
      };
    });

    // ========================================================
    // UPCOMING ASSESSMENT
    // ========================================================

    const upcomingTest = await Test.findOne({
      createdBy: teacherId,

      isActive: true,

      status: "published",

      startTime: {
        $gt: now,
      },
    })
      .select("title duration problems startTime endTime accessCode")
      .sort({
        startTime: 1,
      })
      .lean();

    const upcomingAssessment = upcomingTest
      ? {
          _id: upcomingTest._id,

          title: upcomingTest.title,

          problems: upcomingTest.problems.length,

          duration: upcomingTest.duration,

          startTime: upcomingTest.startTime,

          endTime: upcomingTest.endTime,

          accessCode: upcomingTest.accessCode,
        }
      : null;

    // ========================================================
    // PERFORMANCE DATA
    // ========================================================

    const finalSubmissions = teacherTestIds.length
      ? await Submission.find({
          test: {
            $in: teacherTestIds,
          },

          status: "submitted",
        })
          .select("test problems")
          .lean()
      : [];

    // --------------------------------------------------------
    // Get test -> total questions map
    // --------------------------------------------------------

    const testsForStats = teacherTestIds.length
      ? await Test.find({
          _id: {
            $in: teacherTestIds,
          },
        })
          .select("_id problems")
          .lean()
      : [];

    const totalQuestionMap = new Map();

    testsForStats.forEach((test) => {
      totalQuestionMap.set(test._id.toString(), test.problems.length);
    });

    // --------------------------------------------------------
    // Calculate stats
    // --------------------------------------------------------

    let totalQuestionsAvailable = 0;

    let totalQuestionsAttempted = 0;

    let totalQuestionsSolved = 0;

    finalSubmissions.forEach((submission) => {
      const testId = submission.test.toString();

      totalQuestionsAvailable += totalQuestionMap.get(testId) || 0;

      totalQuestionsAttempted += submission.problems?.length || 0;

      totalQuestionsSolved +=
        submission.problems?.filter((item) => item.verdict === "Accepted")
          .length || 0;
    });

    const solveRate =
      totalQuestionsAvailable > 0
        ? Number(
            ((totalQuestionsSolved / totalQuestionsAvailable) * 100).toFixed(1),
          )
        : 0;

    const averageSolvedPerTest =
      finalSubmissions.length > 0
        ? Number((totalQuestionsSolved / finalSubmissions.length).toFixed(1))
        : 0;

    const performance = {
      solveRate,

      solvedQuestions: totalQuestionsSolved,

      attemptedQuestions: totalQuestionsAttempted,

      totalQuestions: totalQuestionsAvailable,

      averageSolvedPerTest,

      submittedTests: finalSubmissions.length,
    };

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      summary: {
        totalProblems,
        totalTests,
        totalStudents,
        totalSubmissions,
      },

      recentTests,

      upcomingAssessment,

      performance,
    });
  } catch (error) {
    console.error("GET TEACHER DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch teacher dashboard",

      error: error.message,
    });
  }
};
