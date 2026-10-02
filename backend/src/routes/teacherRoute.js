import express from "express";

import {
  allStudent,
} from "../controllers/studentController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";
import { getStudentById } from "../controllers/userController.js";

const router =
  express.Router();

router.use(protect);

router.use(
  authorizeRoles(
    "teacher",
    "admin",
  ),
);

router.get(
  "/students",
  allStudent,
);
router.get(
  "/students/:id",
  authorizeRoles(
    "teacher",
    "admin",
  ),
  getStudentById,
);

export default router;