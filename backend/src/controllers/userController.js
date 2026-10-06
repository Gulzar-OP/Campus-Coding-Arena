import User from "../models/User.js";
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

export const getMyProfile = async (
  req,
  res,
) => {
  try {
    const user = await User.findById(
      req.user._id,
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch profile",
      error: error.message,
    });
  }
};

export const updateMyProfile = async (req, res) => {
    try {
      const {
        name,
        branch,
        year,
      } = req.body;

      const user =
        await User.findById(
          req.user._id,
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      // ============================
      // NAME
      // ============================

      if (
        name !== undefined
      ) {
        if (!name.trim()) {
          return res.status(400).json({
            success: false,
            message:
              "Name cannot be empty",
          });
        }

        user.name =
          name.trim();
      }

      // ============================
      // BRANCH
      // ============================

      if (
        branch !== undefined
      ) {
        user.branch =
          branch.trim();
      }

      // ============================
      // YEAR
      // ============================

      if (
        year !== undefined
      ) {
        const parsedYear =
          Number(year);

        if (
          Number.isNaN(
            parsedYear,
          ) ||
          parsedYear < 1 ||
          parsedYear > 4
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Year must be between 1 and 4",
          });
        }

        user.year =
          parsedYear;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully",

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          branch: user.branch,
          year: user.year,
          role: user.role,
          solvedProblems:
            user.solvedProblems,
          createdAt:
            user.createdAt,
          updatedAt:
            user.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update profile",
        error: error.message,
      });
    }
};

export const getStudentById = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const student =
      await User.findOne({
        _id: id,
        role: "student",
      })
        .select("-password")
        .populate({
          path: "solvedProblems",
          select:
            "title difficulty topic",
        });

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error(
      "GET STUDENT BY ID ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student",
      error: error.message,
    });
  }
};

export const allStudent = async(req, res)=>{

}

export const getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({
      isVerified: false,
    });
    console.log("UNVERIFIED USERS:", users);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "GET UNVERIFIED USERS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unverified users",
      error: error.message,
    });
  }
};

// GET ALL UNVERIFIED STUDENTS
export const getVerificationRequests = async (
  req,
  res,
) => {
  try {
    const users = await User.find({
      role: "student",
      isVerified: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "GET VERIFICATION REQUESTS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch verification requests",
    });
  }
};

export const verifyStudent = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
      },
      {
        $set: {
          isVerified: true,
        },
      },
      {
        new: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student verified successfully",
      user,
    });
  } catch (error) {
    console.error(
      "VERIFY STUDENT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify student",
      error: error.message,
    });
  }
};

export const removeVerificationRequest = async (
  req,
  res,
) => {
  try {
    const user = await User.findById(
      req.params.id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Teacher or admin account cannot be removed",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Verified student cannot be removed from requests",
      });
    }

    await User.findByIdAndDelete(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message:
        "Verification request removed successfully",
    });
  } catch (error) {
    console.error(
      "REMOVE REQUEST ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove verification request",
    });
  }
};