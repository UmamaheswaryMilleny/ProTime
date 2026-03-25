import { redisClient } from "../config/redis.config";
import { injectable } from "tsyringe";
import { ITempUserService } from "../../application/service_interface/temp-user.service.interface";
import { TempUser } from "../../application/service_interface/temp-user.service.interface"; 

import { logger } from "../config/logger.config";

@injectable()
export class TempUserService implements ITempUserService {
async storeUser(email: string, data: TempUser,ttlSeconds:number):Promise<void> {
  logger.debug("Redis store temp_user:", { email });
  await redisClient.set(`temp_user:${email}`, JSON.stringify(data), { EX: ttlSeconds });
}

  async getUser(email: string) {
    const data = await redisClient.get(`temp_user:${email}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteUser(email: string) {
    await redisClient.del(`temp_user:${email}`);
  }
  
}
