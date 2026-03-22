import type { TodoEntity } from '../../domain/entities/todo.entity';
import { DAILY_XP_CAP, TodoStatus } from '../../domain/enums/todo.enums';
import type {
  TodoResponseDTO,
} from '../dto/todo/response/todo.response.dto';

import { TodoListResponseDTO } from '../dto/todo/response/todolist-response.dto';

export class TodoMapper {
  static toResponse(todo: TodoEntity): TodoResponseDTO {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description ?? null,
      priority: todo.priority,
      estimatedTime: todo.estimatedTime,
      status: todo.status,

      pomodoroEnabled: todo.pomodoroEnabled,
      pomodoroCompleted: todo.pomodoroCompleted,
      actualPomodoroTime: todo.actualPomodoroTime,
      pomodoroStatus: todo.pomodoroStatus,
      lastPausedAt: todo.lastPausedAt ? todo.lastPausedAt.toISOString() : null,
      // breakTime: todo.breakTime,
      smartBreaks: todo.smartBreaks,

      baseXp: todo.baseXp,
      bonusXp: todo.bonusXp,
      xpCounted: todo.xpCounted,
      expiryDate: todo.expiryDate ? todo.expiryDate.toISOString() : null,
      // isShared: todo.isShared,
      sharedWith: todo.sharedWith,

      completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }

  // used when the main todo dashboard loads:
  static toListResponse(
    todos: TodoEntity[],
    todayXp: number,
  ): TodoListResponseDTO {
    const totalTasks = todos.length;
    const completed = todos.filter(
      (t) => t.status === TodoStatus.COMPLETED,
    ).length;
    const shared = todos.filter((t) => t.sharedWith.length > 0).length;
    const progress =
      totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);
    const expired = todos.filter(
      (t) => t.status === TodoStatus.EXPIRED
    ).length;
    return {
      todos: todos.map(TodoMapper.toResponse),
      totalTasks,
      completed,
      shared,
      progress,
      expired,
      todayXp,
      dailyXpCap: DAILY_XP_CAP,
    };
  }
}
