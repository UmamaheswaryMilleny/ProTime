import { injectable } from "tsyringe";
// import { RedisClientOptions } from "redis";
import { redisClient } from "../config/redisConfig.js";
import type { IOtpService } from "../../domain/service-interfaces/otp-service-interface.js";

@injectable()
export class OtpService implements IOtpService {
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeOtp(email: string, otp: string): Promise<void> {
    await redisClient.set(`otp:${email}`, otp, { EX: 120 });
  }

  async verifyOtp({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }): Promise<boolean> {
    const storedOtp = await redisClient.get(`otp:${email}`);
    console.log("Stored OTP in Redis:", storedOtp);
    return storedOtp === otp;
  }
async getOtp(email: string): Promise<string | null> {
  return await redisClient.get(`otp:${email}`);
}

  async deleteOtp(email: string): Promise<void> {
    await redisClient.del(`otp:${email}`);
  }
}