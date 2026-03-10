import type { TodoEntity } from '../../entities/todo.entity';
import type { TodoPriority } from '../../enums/todo.enums';
import type { IBaseRepository } from '../base/base.repository.interface';

export interface ITodoRepository extends IBaseRepository<TodoEntity> {
  // Get all todos for a user with optional status filter
  findByUserId(
    userId: string,
    filter?: 'all' | 'pending' | 'completed'|'expired',
  ): Promise<TodoEntity[]>;

  // Returns total XP earned today — compared against DAILY_XP_CAP (50)
  // getTotalXpEarnedToday(userId: string): Promise<number>;

  // Badge system — High Achiever (10 HIGH), Medium Master (15 MEDIUM), Steady Starter (20 LOW)
  countCompletedByPriority(
    userId: string,
    priority: TodoPriority,
  ): Promise<number>;
  // Find all expired todos that haven't been marked yet
// findExpiredTodos(): Promise<TodoEntity[]>;

 markExpiredTodos(): Promise<void>;
}
