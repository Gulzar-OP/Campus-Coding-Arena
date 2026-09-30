import express from "express";

import {
  createTest,
  getAllTests,
  getTestById,
  publishTest,
  unpublishTest,
  updateTest,
  addProblemToTest,
  removeProblemFromTest,
  deleteTest,
  startTest,
  finishTest,
  getTestResults,
  joinTest,
  getTestParticipants,
} from "../controllers/testController.js";
import { getMyAttempt } from "../controllers/testController2.js";
import { protect } from "../middleware/authMiddleware.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { getStudentAttemptDetails } from "../controllers/testController2.js";

const router = express.Router();

// all routes authenticated
router.use(protect);

// ==============================
// STUDENT ROUTES
// ==============================

router.post("/join", authorizeRoles("student"), joinTest);

router.post("/:id/start", authorizeRoles("student"), startTest);

router.get("/:id/attempt", authorizeRoles("student"), getMyAttempt);

router.post("/:id/finish", authorizeRoles("student"), finishTest);

router.get("/", getAllTests);

router.get("/:id", getTestById);

// ==============================
// TEACHER / ADMIN ROUTES
// ==============================

router.post("/", authorizeRoles("teacher", "admin"), createTest);

router.post("/:id/publish", authorizeRoles("teacher", "admin"), publishTest);

router.post(
  "/:id/unpublish",
  authorizeRoles("teacher", "admin"),
  unpublishTest,
);

router.put("/:id", authorizeRoles("teacher", "admin"), updateTest);

router.post(
  "/:id/problems",
  authorizeRoles("teacher", "admin"),
  addProblemToTest,
);

router.delete(
  "/:id/problems/:problemId",
  authorizeRoles("teacher", "admin"),
  removeProblemFromTest,
);
router.delete("/:id/delete-test",authorizeRoles("teacher","admin"),deleteTest)

router.get("/:id/results", authorizeRoles("teacher", "admin"), getTestResults);

router.get(
  "/:id/participants",
  authorizeRoles("teacher", "admin"),
  getTestParticipants,
);

router.get(
  "/:id/participants/:attemptId",
  authorizeRoles("teacher", "admin"),
  getStudentAttemptDetails,
);

export default router;
