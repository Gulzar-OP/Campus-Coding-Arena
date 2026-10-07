import { Worker } from "bullmq";

import queueRedis from "../config/queueRedis.js";
import { executeCode } from "../services/codeRunnerService.js";

const codeExecutionWorker = new Worker(
  "code-execution",

  async (job) => {
    const { code, language, testCases } = job.data;

    console.log("\n=================================");
    console.log(`🚀 Executing job ${job.id}`);
    console.log("Language:", language);
    console.log("Code length:", code?.length);
    console.log("Total test cases:", testCases?.length);

    console.log(
      "Test case sizes:",
      testCases?.map((tc, index) => ({
        testCase: index + 1,
        inputLength: String(tc?.input ?? "").length,
        expectedLength: String(tc?.expectedOutput ?? "").length,
        hidden: Boolean(tc?.isHidden),
      })),
    );

    console.log("=================================\n");

    return executeCode({
      code,
      language,
      testCases,
    });
  },

  {
    connection: queueRedis,
    concurrency: 1,
  },
);

codeExecutionWorker.on("completed", (job, result) => {
  console.log(
    `✅ Judge job ${job.id} completed:`,
    result?.status,
  );
});

codeExecutionWorker.on("failed", (job, error) => {
  console.error(
    `❌ Queue job failed: ${job?.id}`,
  );

  console.error("MESSAGE:", error.message);
  console.error("CODE:", error.code);
  console.error("STACK:", error.stack);
});

codeExecutionWorker.on("error", (error) => {
  console.error(
    "❌ WORKER ERROR:",
    error,
  );
});

export default codeExecutionWorker;