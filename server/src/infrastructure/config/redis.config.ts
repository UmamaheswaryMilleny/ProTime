import { createClient } from "redis"
import { config } from "../../shared/config/index.js";

export const redisClient = createClient({
  url: config.redis.url
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error", err);
});

// Make sure Redis is connected. If it already is, do nothing.”
export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};