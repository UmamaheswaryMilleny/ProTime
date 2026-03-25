import { injectable } from "tsyringe";
// import { RedisClientOptions } from "redis";
import { redisClient } from "../config/redis.config";
import type { IOtpService } from "../../application/service_interface/otp.service.interface";
import { randomInt } from "crypto";

import { logger } from "../config/logger.config";

@injectable()
export class OtpService implements IOtpService {
  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async storeOtp(
    email: string,
    otp: string,
    ttlSeconds: number,
  ): Promise<void> {
    await redisClient.set(`otp:${email}`, otp, { EX: ttlSeconds });
  }

  async verifyOtp({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }): Promise<boolean> {
    const storedOtp = await redisClient.get(`otp:${email}`);
    logger.debug("Stored OTP in Redis:", { email, storedOtp });
    return storedOtp === otp;
  }
  async getOtp(email: string): Promise<string | null> {
    return await redisClient.get(`otp:${email}`);
  }

  async deleteOtp(email: string): Promise<void> {
    await redisClient.del(`otp:${email}`);
  }
}
