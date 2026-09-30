export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    console.log("REQ USER:", req.user);
    console.log(
      "REQ USER ROLE:",
      req.user?.role,
    );

    console.log(
      "ALLOWED ROLES:",
      roles,
    );

    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "User not authenticated",
        });
    }

    const userRole =
      String(
        req.user.role || "",
      )
        .trim()
        .toLowerCase();

    const allowedRoles =
      roles.map((role) =>
        String(role)
          .trim()
          .toLowerCase(),
      );

    if (
      !allowedRoles.includes(
        userRole,
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "You are not authorized to access this route",
        });
    }

    next();
  };