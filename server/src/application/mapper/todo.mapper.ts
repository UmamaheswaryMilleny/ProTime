import type { TodoEntity } from '../../domain/entities/todo.entity';
import { DAILY_XP_CAP, TodoStatus } from '../../domain/enums/todo.enums';
import type {
  TodoResponseDTO,
  TodoListResponseDTO,
} from '../dto/todo/response/todo.response.dto';

export class TodoMapper {
  static toResponse(todo: TodoEntity): TodoResponseDTO {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      estimatedTime: todo.estimatedTime,
      status: todo.status,

      pomodoroEnabled: todo.pomodoroEnabled,
      pomodoroCompleted: todo.pomodoroCompleted,
      actualPomodoroTime: todo.actualPomodoroTime,
      // breakTime: todo.breakTime,
       smartBreaks: todo.smartBreaks,

      baseXp: todo.baseXp,
      bonusXp: todo.bonusXp,
      xpCounted: todo.xpCounted,

      isShared: todo.isShared,
      sharedWith: todo.sharedWith ?? [],

      completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }

  static toListResponse(
    todos: TodoEntity[],
    todayXp: number,
  ): TodoListResponseDTO {
    const totalTasks = todos.length;
    const completed = todos.filter(
      (t) => t.status === TodoStatus.COMPLETED,
    ).length;
    const shared = todos.filter((t) => t.isShared).length;
    const progress =
      totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);
    return {
      todos: todos.map(TodoMapper.toResponse),
      totalTasks,
      completed,
      shared,
      progress,
      todayXp,
      dailyXpCap: DAILY_XP_CAP,
    };
  }
}
