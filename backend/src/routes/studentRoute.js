import express from "express";

import {
  getStudentDashboard,
  getMyResults,getResultByTest
} from "../controllers/studentController.js";

import {
  protect,
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
  getStudentDashboard,
);
router.get(
  "/results/:testId",
  getResultByTest,
);


router.get(
  "/results",
  getMyResults,
);

export default router;