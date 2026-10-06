import IORedis from "ioredis";

const queueRedis = new IORedis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null,
  }
);

queueRedis.on("connect", () => {
  console.log("✅ BullMQ Redis connected");
});

queueRedis.on("error", (err) => {
  console.error(
    "❌ BullMQ Redis error:",
    err.message
  );
});

export default queueRedis;