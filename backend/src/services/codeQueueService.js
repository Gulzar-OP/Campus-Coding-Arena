import {
  codeExecutionQueue,
  codeExecutionQueueEvents,
} from "../queue/codeExecutionQueue.js";

export const queueCodeExecution =
  async ({
    code,
    language,
    testCases,
    userId,
    testId,
    problemId,
  }) => {
    const job =
      await codeExecutionQueue.add(
        "run-code",
        {
          code,
          language,
          testCases,

          userId:
            userId?.toString(),

          testId:
            testId?.toString(),

          problemId:
            problemId?.toString(),
        },
      );

    console.log(
      `📥 Code queued: ${job.id}`,
    );

    const result =
      await job.waitUntilFinished(
        codeExecutionQueueEvents,

        // max wait: 2 minutes
        120000,
      );

    return result;
  };