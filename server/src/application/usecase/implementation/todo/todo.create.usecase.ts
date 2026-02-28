import { inject, injectable } from "tsyringe";
import type { ICreateTodoUsecase } from "../../interface/todo/todo-create.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import type { CreateTodoRequestDTO } from "../../../dto/todo/request/todo.create.request.dto";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";
import { TodoMapper } from "../../../mapper/todo.mapper";

import { ESTIMATED_TIME_OPTIONS, TodoStatus, BASE_XP, TodoPriority, } from "../../../../domain/enums/todo.enums";
import { InvalidEstimatedTimeError } from "../../../../domain/errors/todo.error";

@injectable()
export class CreateTodoUsecase implements ICreateTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) { }

  async execute(userId: string, data: CreateTodoRequestDTO): Promise<TodoResponseDTO> {
    const { title, description, priority, estimatedTime, pomodoroEnabled, smartBreaks } = data;

    // 1. Validate estimatedTime is allowed for the given priority
    const validTimes = ESTIMATED_TIME_OPTIONS[priority];
    if (!validTimes.includes(estimatedTime)) {
      throw new InvalidEstimatedTimeError(priority, estimatedTime);
    }

    // 3. Set baseXp at creation time — correct value locked in immediately
    // ✅ Fixed: was setting baseXp: 0, which CompleteTodoUsecase then overwrote
    // bonusXp stays 0 until pomodoro is completed
    const baseXp = BASE_XP[priority];

    // 4. Create the todo
    const todo = await this.todoRepository.save({
      userId,
      title,
      description,
      priority,
      estimatedTime,
      status: TodoStatus.PENDING,
      pomodoroEnabled,
      pomodoroCompleted: false,
      actualPomodoroTime: undefined,
      smartBreaks: pomodoroEnabled ? (smartBreaks ?? true) : undefined,
      baseXp,    // ✅ Set correctly at creation
      bonusXp: 0,
      xpCounted: false,
      isShared: false,
      sharedWith: [],
      completedAt: undefined,
    });

    return TodoMapper.toResponse(todo);
  }
}