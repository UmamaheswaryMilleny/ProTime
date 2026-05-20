import type { ProfileEntity } from "../../entities/profile.entity";
import type { IBaseRepository } from "../base/base.repository.interface";

export interface IProfileRepository extends IBaseRepository<ProfileEntity> {
  findByUserId(userId: string): Promise<ProfileEntity | null>;

  updateByUserId(
    userId: string,
    data: Partial<ProfileEntity>,
  ): Promise<ProfileEntity | null>;

  //prevents two different users havingexcludeUserId — prevents the user from colliding with their own the same username
  // /
  existsByUsername(username: string, excludeUserId?: string): Promise<boolean>;
  // Used when you need to display multiple users at once — leaderboard, buddy list.
  findByUserIds(userIds: string[]): Promise<ProfileEntity[]>;
}
