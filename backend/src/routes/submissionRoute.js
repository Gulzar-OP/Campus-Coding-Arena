import express from "express";

import {
  submitCode,
  getMySubmissions,
  getProblemSubmissions,
  getSubmissionById,
} from "../controllers/submissionController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/submit",
  authorizeRoles("student"),
  submitCode,
);

router.get(
  "/my",
  authorizeRoles("student"),
  getMySubmissions,
);

router.get(
  "/problem/:problemId",
  authorizeRoles("student"),
  getProblemSubmissions,
);

router.get(
  "/:id",
  authorizeRoles("student"),
  getSubmissionById,
);

// router.get(
//   "/:id/attempt",
//   protect,
//   authorizeRoles("student"),
//   getMyAttempt,
// );

export default router;