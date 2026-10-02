import { createClient } from "redis";

const redisClient = createClient({
  url:
    process.env.REDIS_URL ||
    "redis://localhost:6379",
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

      // Server ko crash nahi karenge
      // because Redis limiter support service hai.
    }
  };

export default redisClient;