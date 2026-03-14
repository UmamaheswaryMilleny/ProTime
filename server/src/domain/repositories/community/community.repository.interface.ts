import type { IBaseRepository } from '../base/base.repository.interface';
import type { CommunityChatEntity } from '../../entities/community.entity';

export interface ICommunityMessageRepository
  extends IBaseRepository<CommunityChatEntity> {

  // Cursor-based — returns messages older than `before`, sorted createdAt desc
  // Client reverses array for display (oldest top, newest bottom)
  findMessages(params: {
    limit:   number;
    before?: Date;
  }): Promise<CommunityChatEntity[]>;

  // Rolling 30-day count — free user quota check on every send
  countMonthlyMessages(userId: string): Promise<number>;
}