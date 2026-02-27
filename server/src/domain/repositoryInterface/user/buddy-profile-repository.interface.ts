import type { IBuddyProfileEntity } from "../../entities/buddy-profile.entity.js";

export interface IBuddyProfileRepository {
  findByUserId(
    userId: string
  ): Promise<IBuddyProfileEntity | null>;

  // store those preferences.
  save(
    profile: IBuddyProfileEntity
  ): Promise<IBuddyProfileEntity>;

  findMatches(
    filters: Partial<IBuddyProfileEntity>
  ): Promise<IBuddyProfileEntity[]>;
}
