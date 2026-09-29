import User from "../models/user.js";
import Submission from "../models/submission.js";

export const getMyStats = async (
  req,
  res,
) => {
  try {
    const user = await User.findById(
      req.user._id,
    ).populate(
      "solvedProblems",
      "title difficulty topic slug",
    );

    const totalSubmissions =
      await Submission.countDocuments({
        user: req.user._id,
      });

    const acceptedSubmissions =
      await Submission.countDocuments({
        user: req.user._id,
        verdict: "Accepted",
      });

    const easySolved =
      user.solvedProblems.filter(
        (problem) =>
          problem.difficulty === "Easy",
      ).length;

    const mediumSolved =
      user.solvedProblems.filter(
        (problem) =>
          problem.difficulty === "Medium",
      ).length;

    const hardSolved =
      user.solvedProblems.filter(
        (problem) =>
          problem.difficulty === "Hard",
      ).length;

    return res.status(200).json({
      success: true,

      stats: {
        totalSolved:
          user.solvedProblems.length,

        easySolved,
        mediumSolved,
        hardSolved,

        totalSubmissions,
        acceptedSubmissions,
      },

      solvedProblems:
        user.solvedProblems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user stats",
      error: error.message,
    });
  }
};