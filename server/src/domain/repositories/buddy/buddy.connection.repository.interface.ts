import type { IBaseRepository } from '../base/base.repository.interface';
import type { BuddyConnectionEntity } from '../../entities/buddy.entities';

export interface IBuddyConnectionRepository
  extends IBaseRepository<BuddyConnectionEntity> {

  // Full buddy list sorted by lastSessionAt desc
  findByUserId(userId: string): Promise<BuddyConnectionEntity[]>;

// ✅ clearer comment — tells the infra layer exactly what query to write
// Check if a connection exists in either direction:
// (userId=A AND buddyId=B) OR (userId=B AND buddyId=A)
  findConnection(
    userId:  string,
    buddyId: string,
  ): Promise<BuddyConnectionEntity | null>;

  // Count CONNECTED connections accepted within the last 30 days
  // Used for free user quota check — quota consumed on accept, not on search
  countAcceptedThisMonth(userId: string): Promise<number>;

  // Returns connections meeting badge criteria:
  // rating >= minRating AND totalSessionMinutes >= minMinutes
  findQualifiedConnections(
    userId:     string,
    minRating:  number,
    minMinutes: number,
  ): Promise<BuddyConnectionEntity[]>;

  // Update connection status when receiver accepts or declines
  updateStatus(
    connectionId: string,
    status: BuddyConnectionEntity['status'],
  ): Promise<BuddyConnectionEntity | null>;

  // Update session stats after a 1:1 session ends
  updateSessionStats(
    userId:  string,
    buddyId: string,
    data: Partial<Pick<BuddyConnectionEntity,
      | 'rating'
      | 'totalSessionsCompleted'
      | 'totalSessionMinutes'
      | 'lastSessionAt'
    >>,
  ): Promise<BuddyConnectionEntity | null>;

  // Returns all PENDING connections where this user is the receiver
findPendingByReceiverId(receiverId: string): Promise<BuddyConnectionEntity[]>;
}