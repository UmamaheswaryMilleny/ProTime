import { inject, injectable } from 'tsyringe';
import type { IExpireTodosUsecase } from '../../interface/todo/expire-todos.usecase.interface';
import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { INotificationService } from '../../../service_interface/notification-service.interface';
import { NotificationType } from '../../../service_interface/notification-service.interface';

@injectable()
export class ExpireTodosUsecase implements IExpireTodosUsecase {
  constructor(
    @inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,
    @inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(): Promise<void> {
    const expiredTodos = await this.todoRepository.markExpiredTodos();

    if (expiredTodos.length === 0) return;

    // Group by userId — one notification per user, no matter how many tasks expired
    const byUser = new Map<string, string[]>();
    for (const todo of expiredTodos) {
      const existing = byUser.get(todo.userId) ?? [];
      existing.push(todo.title);
      byUser.set(todo.userId, existing);
    }

    for (const [userId, titles] of byUser.entries()) {
      const isSingle = titles.length === 1;
      const message = isSingle
        ? `"${titles[0]}" has expired without being completed.`
        : `${titles.length} tasks have expired: ${titles.map(t => `"${t}"`).join(', ')}.`;

      this.notificationService.notifyUser(userId, {
        type: NotificationType.TASK_EXPIRED,
        title: 'Task Expired',
        message,
        metadata: { count: titles.length },
      });
    }
  }
}
