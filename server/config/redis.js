import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL || "redis://localhost:6379",
});

let redisConnected = false;

// Suppress connection errors to avoid spam - they're handled gracefully in cache utils
redisClient.on("error", (err) => {
  redisConnected = false;
  // Only log if it's not the expected ECONNREFUSED error
  if (!err.message.includes("ECONNREFUSED")) {
    console.error("Redis Error:", err.message);
  }
});

redisClient.on("connect", () => {
  console.log("✓ Redis connected successfully");
  redisConnected = true;
});

(async () => {
  try {
    await redisClient.connect();
    redisConnected = true;
  } catch (error) {
    // Redis not available - caching will be disabled silently
    redisConnected = false;
  }
})();

export { redisClient, redisConnected };