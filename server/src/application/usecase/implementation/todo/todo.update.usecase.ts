import { inject, injectable } from "tsyringe";
import type { IUpdateTodoUsecase } from "../../interface/todo/todo-update.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import type { UpdateTodoRequestDTO } from "../../../dto/todo/request/todo.update.request.dto";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";
import { TodoMapper } from "../../../mapper/todo.mapper";
import {
  TodoPriority,
  TodoStatus,
  BASE_XP,
  ESTIMATED_TIME_OPTIONS,
} from "../../../../domain/enums/todo.enums";

import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
  TodoAlreadyCompletedError,
  InvalidEstimatedTimeError,
} from "../../../../domain/errors/todo.error";


@injectable()
export class UpdateTodoUsecase implements IUpdateTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) { }

  async execute(
    userId: string,
    todoId: string,
    data: UpdateTodoRequestDTO
  ): Promise<TodoResponseDTO> {
    // 1. Find the todo
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();

    // 2. Ownership check
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    // 3. Cannot edit a completed task
    if (todo.status === TodoStatus.COMPLETED) throw new TodoAlreadyCompletedError();

    // 4. Determine effective priority (new one if changing, existing if not)
    const effectivePriority = (data.priority ?? todo.priority) as TodoPriority;

    // 5. Validate estimatedTime against effective priority if provided
    if (data.estimatedTime !== undefined) {
      const validTimes = ESTIMATED_TIME_OPTIONS[effectivePriority];
      if (!validTimes.includes(data.estimatedTime)) {
        throw new InvalidEstimatedTimeError(effectivePriority, data.estimatedTime);
      }
    }

    // 7. If priority changed, recalculate baseXp
    const baseXpUpdate =
      data.priority && data.priority !== todo.priority
        ? { baseXp: BASE_XP[data.priority as TodoPriority] }
        : {};

    // 8. Build update payload — only include defined fields
    const updateData: Record<string, unknown> = { ...baseXpUpdate };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime;
    if (data.pomodoroEnabled !== undefined) {
      updateData.pomodoroEnabled = data.pomodoroEnabled;
      // Disabling pomodoro → clear smart breaks and reset pomodoro state
      if (!data.pomodoroEnabled) {
        updateData.smartBreaks = undefined;
        updateData.pomodoroCompleted = false;
        updateData.actualPomodoroTime = undefined;
      }
    }
    if (data.smartBreaks !== undefined && data.pomodoroEnabled !== false) {
      updateData.smartBreaks = data.smartBreaks;
    }

    const updated = await this.todoRepository.updateById(todoId, updateData as never);
    if (!updated) throw new TodoNotFoundError();

    return TodoMapper.toResponse(updated);
  }
}