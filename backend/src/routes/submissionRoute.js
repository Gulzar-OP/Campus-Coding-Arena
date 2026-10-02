import express from "express";

import {
  submitCode,
  getMySubmissions,
  getProblemSubmissions,
  getSubmissionById,
  getTestSubmission,
} from "../controllers/submissionController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  submitLimiter,
} from "../middleware/codeRateLimiter.js";

const router =
  express.Router();

router.post(
  "/submit",
  protect,
  submitLimiter,
  submitCode,
);

router.get(
  "/my",
  protect,
  getMySubmissions,
);

router.get(
  "/test/:testId",
  protect,
  getTestSubmission,
);

router.get(
  "/problem/:problemId",
  protect,
  getProblemSubmissions,
);

router.get(
  "/:id",
  protect,
  getSubmissionById,
);

export default router;