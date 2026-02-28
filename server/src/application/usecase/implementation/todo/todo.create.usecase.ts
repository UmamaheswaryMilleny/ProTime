import { inject, injectable } from "tsyringe";
import type { ICreateTodoUsecase } from "../../interface/todo/todo-create.usecase.interface.js";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface.js";
import type { CreateTodoRequestDTO } from "../../../dto/todo/request/todo.create.request.dto.js";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto.js";
import { TodoMapper } from "../../../mapper/todo.mapper.js";

import { ESTIMATED_TIME_OPTIONS,TodoStatus,BASE_XP, TodoPriority, } from "../../../../domain/enums/todo.enums.js";
import { BreakTimeRequiredError, InvalidEstimatedTimeError,LowPriorityBreakTimeError } from "../../../../domain/errors/todo.error.js";

@injectable()
export class CreateTodoUsecase implements ICreateTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) {}

  async execute(userId: string, data: CreateTodoRequestDTO): Promise<TodoResponseDTO> {
    const { title, description, priority, estimatedTime, pomodoroEnabled, breakTime } = data;

    // 1. Validate estimatedTime is allowed for the given priority
    const validTimes = ESTIMATED_TIME_OPTIONS[priority];
    if (!validTimes.includes(estimatedTime)) {
      throw new InvalidEstimatedTimeError(priority, estimatedTime);
    }

    // 2. LOW tasks cannot have break time (pomodoro itself is allowed)
    // ✅ Removed: "LOW tasks cannot have pomodoro" — LOW CAN have pomodoro, just no bonus XP
    if (priority === TodoPriority.LOW && breakTime !== undefined) {
      throw new LowPriorityBreakTimeError();
    }

    if (
  pomodoroEnabled &&
  priority !== TodoPriority.LOW &&
  breakTime === undefined
) {
  throw new BreakTimeRequiredError()
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
      breakTime: pomodoroEnabled ? breakTime : undefined,
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