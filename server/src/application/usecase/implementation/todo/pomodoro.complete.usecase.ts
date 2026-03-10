import { inject, injectable } from 'tsyringe';
import type { ICompletePomodoroUsecase } from '../../interface/todo/pomodoro-complete.usecase.interface';
import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';
import { TodoMapper } from '../../../mapper/todo.mapper';
import { POMODORO_MIN_FOR_BONUS,TodoStatus } from '../../../../domain/enums/todo.enums';
import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
  PomodoroNotEnabledError,
  PomodoroAlreadyCompletedError,
  TodoExpiredError,
} from '../../../../domain/errors/todo.error';

import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';

@injectable()
export class CompletePomodoroUsecase implements ICompletePomodoroUsecase {
  constructor(
    @inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,
    @inject('IGamificationRepository')
private readonly gamificationRepository: IGamificationRepository,
  ) {}

  async execute(
    userId: string,
    todoId: string,
    actualPomodoroTime?: number,
  ): Promise<TodoResponseDTO> {
    // 1. Find the todo
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();

    // 2. Ownership check
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    // 3. Pomodoro must be enabled on this task
    if (!todo.pomodoroEnabled) throw new PomodoroNotEnabledError();
// ✅ add after ownership check
if (todo.status === TodoStatus.EXPIRED) throw new TodoExpiredError();
    // 4. Already completed this pomodoro session?
    if (todo.pomodoroCompleted) throw new PomodoroAlreadyCompletedError();

    // 5. Check if actualPomodoroTime meets the minimum for bonus XP
    const minRequired = POMODORO_MIN_FOR_BONUS[todo.priority];
    const meetsMinimum =
      actualPomodoroTime !== undefined && actualPomodoroTime >= minRequired;

    const updated = await this.todoRepository.updateById(todoId, {
      pomodoroCompleted: meetsMinimum,
      actualPomodoroTime: actualPomodoroTime,
    } ); 

    if (!updated) throw new TodoNotFoundError();
await this.gamificationRepository.markPomodoroUsedToday(userId)
    return TodoMapper.toResponse(updated);
  }
}
