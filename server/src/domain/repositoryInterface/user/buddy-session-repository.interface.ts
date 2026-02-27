import type { IBuddySessionEntity } from "../../entities/buddy-session.entity.js";

export interface IBuddySessionRepository {
  // A buddy study session has happened — remember it
  save(session: IBuddySessionEntity): Promise<void>;

  countQualifiedSessions(
    userId: string,
    minRating: number,
    minDuration: number
  ): Promise<number>;
}
