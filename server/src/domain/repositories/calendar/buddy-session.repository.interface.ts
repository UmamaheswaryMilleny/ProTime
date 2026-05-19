import type { IBaseRepository } from '../base/base.repository.interface';
import type { BuddySessionEntity } from '../../entities/calender.entities';

export interface IBuddySessionRepository
  extends IBaseRepository<BuddySessionEntity> {

  findByConversationId(
    conversationId: string,
  ): Promise<BuddySessionEntity[]>;

  findActiveByConversationId(
    conversationId: string,
  ): Promise<BuddySessionEntity | null>;

  findPlannedByUserId(userId: string): Promise<BuddySessionEntity[]>;


  findPlannedSessionsBefore(
    cutoffTime: Date,
  ): Promise<BuddySessionEntity[]>;

  updateStatus(
    id:     string,
    status: BuddySessionEntity['status'],
    data?:  Partial<Pick<BuddySessionEntity, 'startedAt' | 'endedAt'>>,
  ): Promise<BuddySessionEntity | null>;


}
