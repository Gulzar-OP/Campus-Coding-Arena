import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import {
  executeSubmission,
  validateExecutionRequest,
} from "./services/codeRunnerService.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "200kb" }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      service: "campus-coding-arena-runner",
      languages: ["cpp", "java"],
    });
  });

  app.post("/api/execute", async (req, res, next) => {
    try {
      if (
        config.apiKey &&
        req.get("x-runner-key") !== config.apiKey
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid runner API key",
        });
      }

      const validation = validateExecutionRequest(req.body);

      if (validation.error) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      const result = await executeSubmission(validation.value);
      const httpStatus = result.status === "Internal Error" ? 500 : 200;

      return res.status(httpStatus).json({
        success: result.status !== "Internal Error",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);

    res.status(500).json({
      success: false,
      status: "Internal Error",
      message: "Code execution failed",
    });
  });

  return app;
};
