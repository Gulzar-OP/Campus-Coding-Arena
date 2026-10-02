import express from "express";

import {
  runCode,
} from "../controllers/codeController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  codeRunLimiter,
} from "../middleware/codeRateLimiter.js";

const router = express.Router();

router.post(
  "/run",
  protect,
  codeRunLimiter,
  runCode,
);

export default router;