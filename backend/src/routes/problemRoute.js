import express from "express";

import {
  createProblem,
  getAllProblems,
  getProblemBySlug,
  getProblemById,
  getMyProblems,
  getMyProblemStats,
  updateProblem,
  deleteProblem,
} from "../controllers/problemController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";

import {
  addProblemToTest,
} from "../controllers/testController2.js";

const router = express.Router();

// ==============================
// PUBLIC ROUTES
// ==============================

// GET all problems
router.get(
  "/",
  getAllProblems,
);

// GET problem by MongoDB ID
router.get(
  "/id/:id",
  getProblemById,
);

// ==============================
// TEACHER PROBLEM BANK
// ==============================

router.get(
  "/teacher/my",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  getMyProblems,
);

router.get(
  "/teacher/stats",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  getMyProblemStats,
);

// ==============================
// TEACHER / ADMIN CRUD
// ==============================

// Create standalone problem
router.post(
  "/",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  createProblem,
);

// Create problem / optionally attach to test
router.post(
  "/add",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  addProblemToTest,
);

// Update problem
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  updateProblem,
);

// Delete problem
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    "teacher",
    "admin",
  ),
  deleteProblem,
);

// ==============================
// SLUG ROUTE - KEEP LAST
// ==============================

router.get(
  "/:slug",
  getProblemBySlug,
);

export default router;