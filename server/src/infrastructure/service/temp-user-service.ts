import { redisClient } from "../config/redisConfig.js";
import { injectable } from "tsyringe";
import type { ITempUserService } from "../../domain/service-interfaces/temp-user-service-interface.js";

@injectable()
export class TempUserService implements ITempUserService {
async storeUser(email: string, data: any) {
  console.log("Redis store temp_user:", email);
  await redisClient.set(`temp_user:${email}`, JSON.stringify(data), { EX: 600 });
}

  async getUser(email: string) {
    const data = await redisClient.get(`temp_user:${email}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteUser(email: string) {
    await redisClient.del(`temp_user:${email}`);
  }
  
}
