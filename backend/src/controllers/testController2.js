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
      test.createdBy.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot view this attempt",
      });
    }

    // ==============================
    // GET ATTEMPT
    // ==============================

    const attempt =
      await TestAttempt.findOne({
        _id: attemptId,
        test: testId,
      })
        .populate(
          "student",
          "name email branch year",
        )
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
        message:
          "Student attempt not found",
      });
    }

    // ==============================
    // FORMAT PROBLEM RESULTS
    // ==============================

    const problems =
      attempt.problemResults.map(
        (item) => ({
          problem: item.problem,

          status:
            item.status,

          marksObtained:
            item.marksObtained,

          submission:
            item.submission
              ? {
                  id:
                    item.submission._id,

                  language:
                    item.submission
                      .language,

                  code:
                    item.submission
                      .code,

                  verdict:
                    item.submission
                      .verdict,

                  passedTestCases:
                    item.submission
                      .passedTestCases,

                  totalTestCases:
                    item.submission
                      .totalTestCases,

                  executionTime:
                    item.submission
                      .executionTime,

                  memoryUsed:
                    item.submission
                      .memoryUsed,

                  submittedAt:
                    item.submission
                      .createdAt,
                }
              : null,
        }),
      );

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(200).json({
      success: true,

      test: {
        id:
          test._id,

        title:
          test.title,

        duration:
          test.duration,

        maxAIPrompts:
          test.maxAIPrompts,
      },

      attempt: {
        id:
          attempt._id,

        student:
          attempt.student,

        status:
          attempt.status,

        startedAt:
          attempt.startedAt,

        submittedAt:
          attempt.submittedAt,

        aiPromptsUsed:
          attempt.aiPromptsUsed,

        totalMarks:
          attempt.totalMarks,

        problems,
      },
    });
  } catch (error) {
    console.error(
      "GET STUDENT ATTEMPT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch student attempt",

      error:
        error.message,
    });
  }
};

export const getMyAttempt = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const attempt =
      await TestAttempt.findOne({
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
    const startedAt =
      attempt.startedAt ||
      attempt.createdAt;

    const durationInMs =
      test.duration * 60 * 1000;

    const attemptDeadline =
      new Date(
        new Date(startedAt).getTime() +
          durationInMs,
      );

    // Test ka actual endTime bhi cross
    // nahi karna chahiye
    const testEndTime =
      new Date(test.endTime);

    const deadline =
      attemptDeadline < testEndTime
        ? attemptDeadline
        : testEndTime;

    const now = new Date();

    const remainingSeconds =
      Math.max(
        Math.floor(
          (deadline.getTime() -
            now.getTime()) /
            1000,
        ),
        0,
      );

    return res.status(200).json({
      success: true,

      attempt,

      deadline,

      remainingSeconds,
    });
  } catch (error) {
    console.error(
      "GET MY ATTEMPT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch attempt",
      error: error.message,
    });
  }
};

export const addProblemToTest = async (req, res) => {
    try {
      const {
        problemId,
        marks = 10,
      } = req.body;

      const test =
        await Test.findById(
          req.params.id,
        );

      if (!test) {
        return res.status(404).json({
          success: false,
          message:
            "Test not found",
        });
      }

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

      const alreadyAdded =
        test.problems.some(
          (item) =>
            String(
              item.problem,
            ) ===
            String(problemId),
        );

      if (alreadyAdded) {
        return res.status(409).json({
          success: false,
          message:
            "Problem already added to test",
        });
      }

      test.problems.push({
        problem:
          problemId,
        marks,
      });

      await test.save();

      await test.populate(
        "problems.problem",
        "title difficulty topic",
      );

      return res.status(200).json({
        success: true,
        message:
          "Problem added successfully",
        test,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to add problem",
        error: error.message,
      });
    }
  };