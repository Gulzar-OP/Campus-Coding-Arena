import User from "../models/user.js";

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const password = process.env.ADMIN_PASSWORD;

    const name = process.env.ADMIN_NAME || "Campus Admin";

    if (!email || !password) {
      console.log("Admin credentials missing in .env");

      return;
    }

    const existingAdmin = await User.findOne({
      email,
    });

    if (existingAdmin) {
    //   console.log(
    //     "Admin already exists",
    //   );

      return;
    }

    await User.create({
      name,
      email,
      password,
      role: "admin",
      isVerified: true,
    });

    // console.log(
    //   "Admin created successfully",
    // );
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
  }
};

export default createAdmin;
