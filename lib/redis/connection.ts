import { Redis } from "ioredis";

// Redis connection configuration using REDIS_URL
const redisConfig = {
  url: process.env.REDIS_URL,
  lazyConnect: true,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

// Create Redis connection
const redis = new Redis(redisConfig);

// Handle connection events
redis.on("error", (error) => {
  console.error("[Redis] Connection error:", error);
});

export default redis;
