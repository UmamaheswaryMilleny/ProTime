import { injectable } from "tsyringe";
import { redisClient } from "../config/redis.config";
import { IRefreshTokenStore } from "../../application/service_interface/refreshTokenStore";

@injectable()
export class RedisRefreshTokenStore implements IRefreshTokenStore {
  private readonly prefix = "refresh-token:"; //common start for all Redis keys

  private buildKey(userId: string, refreshToken: string): string {
    return `${this.prefix}${userId}:${refreshToken}`;
  }

  async save(
    userId: string,
    refreshToken: string,
    ttlSeconds: number
  ): Promise<void> {
    const key = this.buildKey(userId, refreshToken);
//"1" has no meaning It’s just a placeholder
    await redisClient.set(key, "1", {
      EX: ttlSeconds,
    });
  }

  async exists(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    const key = this.buildKey(userId, refreshToken);

    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  async delete(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const key = this.buildKey(userId, refreshToken);
    await redisClient.del(key);
  }

  //deletes all refresh tokens belonging to that user
  async deleteAll(userId: string): Promise<void> {
    const pattern = `${this.prefix}${userId}:*`;

    const keys: string[] = [];
    for await (const batch of redisClient.scanIterator({
      MATCH: pattern,
    })) {
      keys.push(...(batch as string[]));
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}
