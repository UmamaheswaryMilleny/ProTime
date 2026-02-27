import type { IBuddyMatchEntity } from "../../entities/buddy-match.entity.js";

export interface IBuddyMatchRepository {
  // Is there already a buddy relationship between these two users?
  findBetweenUsers(
    userId: string,
    buddyId: string
  ): Promise<IBuddyMatchEntity | null>;

  countBuddy(userId: string): Promise<number>;

  // Store or update a buddy relationship
  save(match: IBuddyMatchEntity): Promise<IBuddyMatchEntity>;
}
