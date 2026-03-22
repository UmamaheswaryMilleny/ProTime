import { inject, injectable } from 'tsyringe';
import type { IPausePomodoroUsecase } from '../../interface/todo/pomodoro-pause.usecase.interface';
import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';
import { TodoMapper } from '../../../mapper/todo.mapper';
import { PomodoroStatus } from '../../../../domain/enums/todo.enums';
import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
  PomodoroNotEnabledError,
  PomodoroAlreadyCompletedError,
} from '../../../../domain/errors/todo.error';

@injectable()
export class PausePomodoroUsecase implements IPausePomodoroUsecase {
  constructor(
    @inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,
  ) {}

  async execute(userId: string, todoId: string): Promise<TodoResponseDTO> {
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    if (!todo.pomodoroEnabled) throw new PomodoroNotEnabledError();
    if (todo.pomodoroCompleted) throw new PomodoroAlreadyCompletedError();

    const updated = await this.todoRepository.updateById(todoId, {
      pomodoroStatus: PomodoroStatus.PAUSED,
      lastPausedAt: new Date(),
    });

    if (!updated) throw new TodoNotFoundError();
    return TodoMapper.toResponse(updated);
  }
}
