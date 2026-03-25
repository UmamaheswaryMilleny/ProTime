import { injectable } from 'tsyringe';


import { BaseRepository } from '../base.repository';
import { TodoModel } from '../../database/models/todo.model';
import { TodoMapper } from '../../database/mappers/todo.mapper';
import type { ITodoRepository } from '../../../domain/repositories/todo/todo.repository.interface';
import type { TodoEntity } from '../../../domain/entities/todo.entity';
import { TodoPriority,TodoStatus } from '../../../domain/enums/todo.enums';
import type { TodoDocument } from '../../database/models/todo.model';

@injectable()
export class MongoTodoRepository
  extends BaseRepository<TodoDocument, TodoEntity>
  implements ITodoRepository
{
  constructor() {
    super(
      TodoModel,
      TodoMapper.toDomain,
      (data) =>
        TodoMapper.toPersistence(data) as unknown as Partial<TodoDocument>
    );
  }

  // ─── Find all todos for user with optional filter ─────────────────────────
  async findByUserId(
    userId: string,
    filter: 'all' | 'pending' | 'completed' | 'expired'= 'all'
  ): Promise<TodoEntity[]> {
    const query: Record<string, unknown> = {
      userId: userId,
    };
if (filter === 'expired') query.status = TodoStatus.EXPIRED;
    if (filter === 'pending')   query.status = TodoStatus.PENDING;
    if (filter === 'completed') query.status = TodoStatus.COMPLETED;

    const docs = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(TodoMapper.toDomain);
  }

  // ─── Daily XP cap check ───────────────────────────────────────────────────
  // Sums baseXp + bonusXp for all xpCounted tasks completed today by this user.
  // Called by CompleteTodoUsecase to check against DAILY_XP_CAP (50).
  // async getTotalXpEarnedToday(userId: string): Promise<number> {
  //   const startOfDay = new Date();
  //   startOfDay.setUTCHours(0, 0, 0, 0);

  //   const result = await this.model.aggregate<{ total: number }>([
  //     {
  //       $match: {
  //         userId: userId as unknown as Types.ObjectId,
  //         xpCounted: true,
  //         completedAt: { $gte: startOfDay },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: { $add: ['$baseXp', '$bonusXp'] } },
  //       },
  //     },
  //   ]);

  //   return result[0]?.total ?? 0;
  // }

  // ─── Badge system ─────────────────────────────────────────────────────────
  // High Achiever: 10 HIGH | Medium Master: 15 MEDIUM | Steady Starter: 20 LOW
  async countCompletedByPriority(
    userId: string,
    priority: TodoPriority
  ): Promise<number> {
    return this.model.countDocuments({
      userId: userId,
      priority,
      status: TodoStatus.COMPLETED,
    });
  }
  // ─── Cron job — mark expired todos ───────────────────────────────────────
  async markExpiredTodos(): Promise<TodoEntity[]> {
    const query = {
      status: TodoStatus.PENDING,
      expiryDate: { $lte: new Date() },
    };
    const expiredDocs = await this.model.find(query).lean();
    if (expiredDocs.length > 0) {
      await this.model.updateMany(
        { _id: { $in: expiredDocs.map(d => d._id) } },
        { $set: { status: TodoStatus.EXPIRED } }
      );
    }
    return expiredDocs.map(TodoMapper.toDomain);
  }
}