import type { IBaseRepository } from '../base/base.repository.interface';
import type { CommunityChatEntity } from '../../entities/community.entity';

export interface ICommunityMessageRepository
  extends IBaseRepository<CommunityChatEntity> {

 
  findMessages(params: {
    limit: number;
    before?: Date;
    since?: Date;
  }): Promise<CommunityChatEntity[]>;

  // Rolling 30-day count — free user quota check on every send
  countMonthlyMessages(userId: string): Promise<number>;
}