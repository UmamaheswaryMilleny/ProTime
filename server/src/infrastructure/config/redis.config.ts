import { createClient } from "redis";
import { config } from "../../shared/config/index";
import { logger } from "./logger.config";

console.log("========= REDIS URL DEBUG =========");
console.log("REDIS URL:", config.redis.url);
console.log("===================================");

export const redisClient = createClient({
  url: config.redis.url,

  socket: {
    reconnectStrategy: (retries) => {
      logger.warn(`🔄 Redis reconnect attempt: ${retries}`);

      // Retry after delay (max 3 seconds)
      return Math.min(retries * 100, 3000);
    },
  },
});

// Redis Connected
redisClient.on("connect", () => {
  logger.info("✅ Redis connected successfully");
});

// Redis Ready
redisClient.on("ready", () => {
  logger.info("🚀 Redis is ready to use");
});

// Redis Error
redisClient.on("error", (err) => {
  logger.error("❌ Redis connection error", {
    message: err.message,
    stack: err.stack,
  });
});

// Redis Reconnecting
redisClient.on("reconnecting", () => {
  logger.warn("🔄 Redis reconnecting...");
});

// Connect Redis
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();

      logger.info("✅ Redis connection established");
    }
  } catch (error: any) {
    logger.error("❌ Failed to connect Redis", {
      message: error.message,
      stack: error.stack,
    });
  }
};