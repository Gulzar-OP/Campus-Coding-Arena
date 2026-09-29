import express from "express";

import {
  createProblem,
  getAllProblems,
  getProblemBySlug,
  getProblemById,
  updateProblem,
  deleteProblem,
} from "../controllers/problemController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";

const router = express.Router();


// GET all problems
router.get(
  "/",
  getAllProblems,
);


// GET problem by MongoDB id
router.get(
  "/id/:id",
  getProblemById,
);


// GET problem by slug
router.get(
  "/:slug",
  getProblemBySlug,
);


// CREATE problem - admin only
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createProblem,
);


// UPDATE problem - admin only
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateProblem,
);


// DELETE problem - admin only
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteProblem,
);


export default router;