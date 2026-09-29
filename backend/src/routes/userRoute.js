import express from "express";

import {
  getMyStats,
} from "../controllers/userController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/me/stats",
  protect,
  getMyStats,
);

export default router;