import { injectable } from "tsyringe";
import { redisClient } from "../config/redis.config";
import { IResetTokenStore } from "../../application/service_interface/resetTokenStore.service.interface";

@injectable()
export class RedisResetTokenStore implements IResetTokenStore {
  private readonly prefix = "reset-token:";

  private buildKey(userId: string): string {
    return `${this.prefix}${userId}`;
  }

  async save(
    userId: string,
    token: string,
    ttlSeconds: number
  ): Promise<void> {
    // Store token as the VALUE under one key per user
    await redisClient.set(this.buildKey(userId), token, {
      EX: ttlSeconds,
    });
  }

  async exists(
    userId: string,
    token: string
  ): Promise<boolean> {
    // Get stored token and compare directly — no scanIterator needed
    const stored = await redisClient.get(this.buildKey(userId));
    return stored === token;
  }

  async delete(userId: string): Promise<void> {
    // One key per user — simple delete, no scanning needed
    await redisClient.del(this.buildKey(userId));
  }
}