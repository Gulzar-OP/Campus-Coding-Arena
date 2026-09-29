import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(
    user._id,
    user.role,
  );

  const cookieOptions = {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",

    maxAge:
      7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(statusCode)
    .cookie(
      "token",
      token,
      cookieOptions,
    )
    .json({
      success: true,
      message:
        "Authentication successful",

      user: {
        id: user._id,
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
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      branch,
      year,
    });

    sendTokenResponse(
      user,
      201,
      res,
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
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
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
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

    const isMatch =
      await user.comparePassword(
        password,
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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
      message:
        "Server error while logging in",
      error: error.message,
    });
  }
};

// LOGOUT
export const logout = async (
  req,
  res,
) => {
  res.clearCookie("token", {
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      process.env.NODE_ENV ===
      "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    success: true,
    message:
      "Logged out successfully",
  });
};


export const getMe = async (
  req,
  res,
) => {
  try {
    const user =
      await User.findById(
        req.user._id,
      );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch profile",
    });
  }
};