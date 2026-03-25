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
    
    // Notify users for each expired task
    // We can group by userId to avoid spamming multiple notifications, 
    // but the user's request "if a task expire show notification" suggests per-task notification might be okay.
    // For now, let's notify for each.
    for (const todo of expiredTodos) {
      this.notificationService.notifyUser(todo.userId, {
        type: NotificationType.TASK_EXPIRED,
        title: 'Task Expired',
        message: `Your task "${todo.title}" has expired.`,
        metadata: { todoId: todo.id }
      });
    }
  }
}
