import {
  Worker,
} from "bullmq";

import queueRedis from "../config/queueRedis.js";

import {
  executeCode,
} from "../services/codeRunnerService.js";

const codeExecutionWorker =
  new Worker(
    "code-execution",

    async (job) => {
      console.log(
        `🚀 Executing job ${job.id}`,
      );

      const {
        code,
        language,
        testCases,
      } = job.data;

      return await executeCode({
        code,
        language,
        testCases,
      });
    },

    {
      connection:
        queueRedis,

      concurrency: 3,
    },
  );

codeExecutionWorker.on(
  "completed",
  (job) => {
    console.log(
      `✅ Judge job ${job.id} completed`,
    );
  },
);

codeExecutionWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `❌ Judge job ${job?.id} failed:`,
      error.message,
    );
  },
);

export default codeExecutionWorker;