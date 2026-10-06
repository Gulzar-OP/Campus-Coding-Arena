import { createClient } from "redis";

const REDIS_URL =
  process.env.REDIS_URL?.trim() ||
  "redis://localhost:6379";

console.log(
  "Redis URL loaded:",
  REDIS_URL.startsWith("rediss://")
    ? "Render Redis (TLS)"
    : REDIS_URL,
);

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("connect", () => {
  console.log(
    "Redis connecting...",
  );
});

redisClient.on("ready", () => {
  console.log(
    "✅ Redis connected",
  );
});

redisClient.on("error", (err) => {
  console.error(
    "❌ Redis error:",
    err.message,
  );
});

redisClient.on("end", () => {
  console.log(
    "Redis connection closed",
  );
});

export const connectRedis =
  async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    } catch (error) {
      console.error(
        "Redis connection failed:",
        error.message,
      );
    }
  };

export default redisClient;