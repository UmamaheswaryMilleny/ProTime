import type { IBaseRepository } from '../base/base.repository.interface';
import type { CommunityChatEntity } from '../../entities/community.entity';

export interface ICommunityMessageRepository
  extends IBaseRepository<CommunityChatEntity> {

  //So before is just telling the database:"give me messages older than THIS timestamp"
  findMessages(params: {
    limit: number;
    before?: Date;
  }): Promise<CommunityChatEntity[]>;

  // Rolling 30-day count — free user quota check on every send
  countMonthlyMessages(userId: string): Promise<number>;
}