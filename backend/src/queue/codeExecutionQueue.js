import {
  Queue,
  QueueEvents,
} from "bullmq";

import queueRedis from "../config/queueRedis.js";

export const codeExecutionQueue =
  new Queue(
    "code-execution",
    {
      connection: queueRedis,

      defaultJobOptions: {
        attempts: 1,

        removeOnComplete: {
          age: 300,
          count: 100,
        },

        removeOnFail: {
          age: 600,
          count: 100,
        },
      },
    },
  );

export const codeExecutionQueueEvents =
  new QueueEvents(
    "code-execution",
    {
      connection: queueRedis,
    },
  );

codeExecutionQueueEvents.on(
  "completed",
  ({ jobId }) => {
    console.log(
      `✅ Queue job completed: ${jobId}`,
    );
  },
);

codeExecutionQueueEvents.on(
  "failed",
  ({ jobId, failedReason }) => {
    console.log(
      `❌ Queue job failed: ${jobId}`,
      failedReason,
    );
  },
);