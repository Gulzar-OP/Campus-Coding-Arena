import express from "express";

import {
  getMyStats,
  getStudentById,
  getUnverifiedUsers,
  getVerificationRequests,
  removeVerificationRequest,
  verifyStudent,
} from "../controllers/userController.js";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router =
  express.Router();
router.get(
  "/me/stats",
  protect,
  getMyStats,
);
router.get(
  "/me",
  protect,
  getMyProfile,
);

router.put(
  "/me",
  protect,
  updateMyProfile,
);
router.get(
  "/students/:id",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  getStudentById,
);
router.get(
  "/unverified",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  getUnverifiedUsers,
);
router.get(
  "/verification-requests",
  protect,
  authorizeRoles("teacher", "admin"),
  getVerificationRequests,
);

router.patch(
  "/:id/verify",
  protect,
  authorizeRoles("teacher", "admin"),
  verifyStudent,
);

router.delete(
  "/:id/remove-request",
  protect,
  authorizeRoles("teacher", "admin"),
  removeVerificationRequest,
);

export default router;

