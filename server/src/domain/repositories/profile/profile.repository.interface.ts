import type { ProfileEntity } from "../../entities/profile.entity.js";
import type { IBaseRepository } from "../base.repository.interface.js";

export interface IProfileRepository extends IBaseRepository<ProfileEntity> {
  findByUserId(userId: string): Promise<ProfileEntity | null>;

  updateByUserId(
    userId: string,
    data: Partial<ProfileEntity>,
  ): Promise<ProfileEntity | null>;

  existsByUsername(username: string, excludeUserId?: string): Promise<boolean>;
}
