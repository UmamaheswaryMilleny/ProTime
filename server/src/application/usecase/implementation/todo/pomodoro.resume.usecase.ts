import { inject, injectable } from 'tsyringe';
import type { IResumePomodoroUsecase } from '../../interface/todo/pomodoro-resume.usecase.interface';
import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { TodoEntity } from '../../../../domain/entities/todo.entity';
import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';
import { TodoMapper } from '../../../mapper/todo.mapper';
import { PomodoroStatus, POMODORO_MAX_PAUSE_MINUTES } from '../../../../domain/enums/todo.enums';
import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
  PomodoroNotEnabledError,
  PomodoroAlreadyCompletedError,
  PomodoroNotPausedError,
  PomodoroPauseLimitExceededError,
} from '../../../../domain/errors/todo.error';

@injectable()
export class ResumePomodoroUsecase implements IResumePomodoroUsecase {
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
    if (todo.pomodoroStatus !== PomodoroStatus.PAUSED) throw new PomodoroNotPausedError();

    let isRestarted = false;
    if (todo.lastPausedAt) {
      const pauseDurationMinutes = (Date.now() - todo.lastPausedAt.getTime()) / (1000 * 60);
      if (pauseDurationMinutes > POMODORO_MAX_PAUSE_MINUTES) {
        isRestarted = true;
      }
    }

    const updateData: Partial<TodoEntity> = {
      pomodoroStatus: PomodoroStatus.STARTED,
      lastPausedAt: null,
    };

    if (isRestarted) {
      updateData.actualPomodoroTime = 0;
    }

    const updated = await this.todoRepository.updateById(todoId, updateData);
    if (!updated) throw new TodoNotFoundError();

    if (isRestarted) {
        // We throw the error after updating to ensure the restart is saved
        throw new PomodoroPauseLimitExceededError();
    }

    return TodoMapper.toResponse(updated);
  }
}
