import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import codeRoutes from "./routes/codeRoute.js";
import problemRoutes from "./routes/problemRoute.js";
import userRoutes from "./routes/userRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoute.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Campus Coding Arena API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes,
);

app.use(
  "/api/submissions",
  submissionRoutes,
);
app.use(
  "/api/code",
  codeRoutes,
);
app.use(
  "/api/problems",
  problemRoutes,
);

app.use(
  "/api/users",
  userRoutes,
);

app.use(
  "/api/leaderboard",
  leaderboardRoutes,
);

export default app;