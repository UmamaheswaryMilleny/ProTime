import { inject, injectable } from "tsyringe";
import type { ICreateTodoUsecase } from "../../interface/todo/todo-create.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import type { CreateTodoRequestDTO } from "../../../dto/todo/request/todo.create.request.dto";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";
import { TodoMapper } from "../../../mapper/todo.mapper";

import { ESTIMATED_TIME_OPTIONS, TodoStatus, BASE_XP, } from "../../../../domain/enums/todo.enums";
import { InvalidEstimatedTimeError, MissingTodoTitleError } from "../../../../domain/errors/todo.error";

@injectable()
export class CreateTodoUsecase implements ICreateTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) { }

  async execute(userId: string, data: CreateTodoRequestDTO): Promise<TodoResponseDTO> {
    const { title, description, priority, estimatedTime, pomodoroEnabled, smartBreaks } = data;

    // 0. Validate title
    if (!title || title.trim() === '') {
      throw new MissingTodoTitleError();
    }

    // 1. Validate estimatedTime is allowed for the given priority
    const validTimes = ESTIMATED_TIME_OPTIONS[priority];
    if (!validTimes.includes(estimatedTime)) {
      throw new InvalidEstimatedTimeError(priority, estimatedTime);
    }

    // 3. Set baseXp at creation time — correct value locked in immediately
    const baseXp = BASE_XP[priority];

    // 4. Create the todo
    const todo = await this.todoRepository.save({
      userId,
      title,
      description:description??null,
      priority,
      estimatedTime,
      status: TodoStatus.PENDING,
      pomodoroEnabled,
      pomodoroCompleted: false,
      actualPomodoroTime: null,
      smartBreaks: pomodoroEnabled ? (smartBreaks ?? true) : null,
      baseXp,   
      bonusXp: 0,
      xpCounted: false,
      // isShared: false,
      expiryDate:data.expiryDate?new Date(data.expiryDate) : null,
      sharedWith: [],
      completedAt: null,
    });

    return TodoMapper.toResponse(todo);
  }
}