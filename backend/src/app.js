import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoute.js";
// import submissionRoutes from "./routes/submissionRoutes.js";
import codeRoutes from "./routes/codeRoute.js";
import problemRoutes from "./routes/problemRoute.js";
import testRoutes from "./routes/testRoute.js";
import aiRoutes from "./routes/aiRoute.js";
import submissionRoutes from "./routes/submissionRoute.js";
import studentRoutes from "./routes/studentRoute.js";
import userRoutes from "./routes/userRoute.js";
import teacherRoutes from "./routes/teacherRoute.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  "/api/tests",
  testRoutes,
);
app.use(
  "/api/ai",
  aiRoutes,
);
app.use(
  "/api/submissions",
  submissionRoutes,
);
app.use(
  "/api/student",
  studentRoutes,
);
app.use(
  "/api/users",
  userRoutes,
);
app.use("/api/teacher", teacherRoutes);

export default app;