import express from "express";

import {
  getStudentDashboard,
  getMyResults,getResultByTest,
} from "../controllers/studentController.js";

import {
  protect,
  requireVerifiedUser,
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.use(
  authorizeRoles("student"),
);

router.get(
  "/dashboard",
  protect,
  authorizeRoles("student"),
  requireVerifiedUser,
  getStudentDashboard,
);
router.get(
  "/results/:testId",
  protect,
  requireVerifiedUser,
  getResultByTest,
);

router.get(
  "/results",
  protect,
  requireVerifiedUser,
  getMyResults,
);

export default router;