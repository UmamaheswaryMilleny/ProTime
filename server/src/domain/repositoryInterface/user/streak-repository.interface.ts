import type { IStreakEntity } from "../../entities/streak.entity.js";

export interface IStreakRepository {
  // Give me the current streak status of this user
  findByUserId(userId: string): Promise<IStreakEntity | null>;
// Store the updated streak state.
  save(streak: IStreakEntity): Promise<IStreakEntity>;
}
