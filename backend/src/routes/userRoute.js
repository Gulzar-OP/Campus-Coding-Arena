import express from "express";

import {
  getMyStats,
  getStudentById,
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

export default router;