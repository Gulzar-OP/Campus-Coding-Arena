import redisClient from "../config/redis.js";

const MAX_REQUESTS = 2;
const WINDOW_SECONDS = 5;
const BLOCK_SECONDS = 30;

export const codeRunLimiter = async (
  req,
  res,
  next,
) => {
  try {
    /*
      Auth middleware ke baad ye middleware
      use hoga, so req.user available hoga.
    */

    const userId =
      req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    /*
      Example keys:

      code-run:count:USER_ID
      code-run:block:USER_ID
    */

    const countKey =
      `code-run:count:${userId}`;

    const blockKey =
      `code-run:block:${userId}`;

    // Redis unavailable ho to request allow
    if (!redisClient.isOpen) {
      return next();
    }

    /*
      STEP 1
      Check if already blocked
    */

    const isBlocked =
      await redisClient.get(
        blockKey,
      );

    if (isBlocked) {
      const remainingTime =
        await redisClient.ttl(
          blockKey,
        );

      return res.status(429).json({
        success: false,
        message:
          `Too many code executions. Try again after ${remainingTime} seconds.`,
        retryAfter:
          remainingTime,
      });
    }

    /*
      STEP 2
      Increase user's request count
    */

    const currentCount =
      await redisClient.incr(
        countKey,
      );

    /*
      First request par expiration set
    */

    if (currentCount === 1) {
      await redisClient.expire(
        countKey,
        WINDOW_SECONDS,
      );
    }

    /*
      STEP 3
      More than 5 requests
    */

    if (
      currentCount >
      MAX_REQUESTS
    ) {
      /*
        60 seconds block
      */

      await redisClient.set(
        blockKey,
        "blocked",
        {
          EX: BLOCK_SECONDS,
        },
      );

      /*
        old counter remove
      */

      await redisClient.del(
        countKey,
      );

      return res.status(429).json({
        success: false,
        message:
          "Too many code executions. Code execution blocked for 60 seconds.",
        retryAfter:
          BLOCK_SECONDS,
      });
    }

    /*
      Optional response headers
    */

    res.setHeader(
      "X-RateLimit-Limit",
      MAX_REQUESTS,
    );

    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(
        MAX_REQUESTS -
          currentCount,
        0,
      ),
    );

    next();
  } catch (error) {
    console.error(
      "Code rate limiter error:",
      error,
    );

    /*
      Redis error ki wajah se
      student's test stop nahi karenge.
    */

    next();
  }
};

export const submitLimiter = async (
  req,
  res,
  next,
) => {
  try {
    const userId =
      req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (!redisClient.isOpen) {
      return next();
    }

    const key =
      `submission-limit:${userId}`;

    const count =
      await redisClient.incr(
        key,
      );

    if (count === 1) {
      await redisClient.expire(
        key,
        60,
      );
    }

    /*
      Max 3 submission API calls/minute.

      Ye accidental double-click /
      frontend duplicate request /
      malicious spam ko control karega.
    */

    if (count > 3) {
      const ttl =
        await redisClient.ttl(
          key,
        );

      return res.status(429).json({
        success: false,
        message:
          `Too many submission requests. Try again after ${ttl} seconds.`,
        retryAfter: ttl,
      });
    }

    next();
  } catch (error) {
    console.error(
      "Submit limiter error:",
      error,
    );

    next();
  }
};