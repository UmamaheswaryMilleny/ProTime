import type { ProfileEntity } from "../../entities/profile.entity";
import type { IBaseRepository } from "../base/base.repository.interface";

export interface IProfileRepository extends IBaseRepository<ProfileEntity> {
  findByUserId(userId: string): Promise<ProfileEntity | null>;

  updateByUserId(
    userId: string,
    data: Partial<ProfileEntity>,
  ): Promise<ProfileEntity | null>;

  existsByUsername(username: string, excludeUserId?: string): Promise<boolean>;
  findByUserIds(userIds: string[]): Promise<ProfileEntity[]>;
}
