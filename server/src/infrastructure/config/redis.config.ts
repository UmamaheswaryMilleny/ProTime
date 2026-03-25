import { createClient } from "redis"
import { config } from "../../shared/config/index";

export const redisClient = createClient({
  url: config.redis.url
});

import { logger } from "./logger.config";

redisClient.on("connect", () => {
  logger.info("✅ Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("❌ Redis error", { error: err });
});

// Make sure Redis is connected. If it already is, do nothing.”
export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};