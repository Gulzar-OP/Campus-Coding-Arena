import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id,user.role,);

  res.cookie("token", token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    success: true,

    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
    },
  });
};

// REGISTER
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      branch,
      year,
      rollNo,
    } = req.body;

    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and roll number are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const existingRollNo =
      await User.findOne({
        rollNo: rollNo.trim(),
      });

    if (existingRollNo) {
      return res.status(409).json({
        success: false,
        message:
          "Roll number already registered",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,

      role: "student",

      rollNo: rollNo.trim(),

      branch: branch?.trim() || "",

      year: year
        ? Number(year)
        : undefined,

      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Your account is waiting for verification.",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        branch: user.branch,
        year: user.year,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while registering user",
      error: error.message,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (
      user.role === "student" &&
      !user.isVerified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has not been verified yet",
      });
    }

    sendTokenResponse(
      user,
      200,
      res,
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error while logging in",
      error: error.message,
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};
