import IORedis from "ioredis";

const queueRedis =
  new IORedis(
    process.env.REDIS_URL ||
      "redis://localhost:6379",
    {
      maxRetriesPerRequest: null,
    },
  );

queueRedis.on(
  "connect",
  () => {
    console.log(
      "✅ BullMQ Redis connected",
    );
  },
);

queueRedis.on(
  "error",
  (error) => {
    console.error(
      "❌ BullMQ Redis error:",
      error.message,
    );
  },
);

export default queueRedis;