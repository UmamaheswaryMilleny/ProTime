import type { IBaseRepository } from '../base/base.repository.interface';
import type { BuddyConnectionEntity } from '../../entities/buddy.entities';

export interface IBuddyConnectionRepository
  extends IBaseRepository<BuddyConnectionEntity> {

  // Full buddy list sorted by Sorted by lastSessionAt so most recently studied buddies appear first.- "My Buddies" page.
  findByUserId(userId: string): Promise<BuddyConnectionEntity[]>;


  // Check if a connection exists in either direction:
  //before creating a new request — if a connection already exists 
  // (pending, connected, blocked, declined) throw BuddyAlreadyConnectedError. Prevents duplicate connections.
  findConnection(
    userId: string,
    buddyId: string,
  ): Promise<BuddyConnectionEntity | null>;

  // Count CONNECTED connections accepted within the last 30 days
  // Free users are limited to 5 per month
  countAcceptedThisMonth(userId: string): Promise<number>;

  // Returns connections meeting badge criteria:
  // rating >= minRating AND totalSessionMinutes >= minMinutes
  findQualifiedConnections(
    userId: string,
    minRating: number,
    minMinutes: number,
  ): Promise<BuddyConnectionEntity[]>;

  // Update connection status when receiver accepts or declines
  updateStatus(
    connectionId: string,
    status: BuddyConnectionEntity['status'],
  ): Promise<BuddyConnectionEntity | null>;

  // Update session stats after a 1:1 session ends
  updateSessionStats(
    userId: string,
    buddyId: string,
    data: Partial<Pick<BuddyConnectionEntity,
      | 'rating'
      | 'totalSessionsCompleted'
      | 'totalSessionMinutes'
      | 'lastSessionAt'
    >>,
  ): Promise<BuddyConnectionEntity | null>;

  // Returns all PENDING connections where this user is the requester
  findPendingByRequesterId(requesterId: string): Promise<BuddyConnectionEntity[]>;

  // Returns all PENDING connections where this user is the receiver
  findPendingByReceiverId(receiverId: string): Promise<BuddyConnectionEntity[]>;

  // All connections where userId initiated a block
  findBlockedByUserId(userId: string): Promise<BuddyConnectionEntity[]>;

  // Update blockedBy field alongside status..to exclude blocked user from searches
  updateStatusWithBlockedBy(
    connectionId: string,
    status: BuddyConnectionEntity['status'],
    blockedBy?: string,
  ): Promise<BuddyConnectionEntity | null>;
}