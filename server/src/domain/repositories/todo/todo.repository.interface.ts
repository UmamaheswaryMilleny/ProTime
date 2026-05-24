import type { TodoEntity } from '../../entities/todo.entity';
import type { TodoPriority } from '../../enums/todo.enums';
import type { IBaseRepository } from '../base/base.repository.interface';

export interface ITodoRepository extends IBaseRepository<TodoEntity> {

  findByUserId(
    userId: string,
    filter?: 'all' | 'pending' | 'completed' | 'expired',
    page?: number,
    limit?: number,
  ): Promise<TodoEntity[]>;


  //For badges like High Achiever  → Complete 10 High-Priority tasks
  countCompletedByPriority(
    userId: string,
    priority: TodoPriority,
  ): Promise<number>;


  markExpiredTodos(): Promise<TodoEntity[]>;
}
