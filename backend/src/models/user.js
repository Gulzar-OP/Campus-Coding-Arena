import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    rollNo: {
      type: String,
      trim: true,
      uppercase: true,

      // only student ke liye required
      required: function () {
        return this.role === "student";
      },

      unique: true,
      sparse: true,
    },

    branch: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    year: {
      type: Number,
      min: 1,
      max: 4,

      required: function () {
        return this.role === "student";
      },
    },

    solvedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    profileImage: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt,
  );
});

userSchema.methods.comparePassword = async function (
  enteredPassword,
) {
  return bcrypt.compare(
    enteredPassword,
    this.password,
  );
};

// const User = mongoose.model(
//   "User",
//   userSchema,
// );

// export default User;

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema,
  );

export default User;