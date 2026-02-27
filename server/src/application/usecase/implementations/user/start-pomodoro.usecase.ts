import { inject, injectable } from "tsyringe";
import type { IPomodoroRepository } from "../../../domain/repositoryInterface/pomodoro/pomodoro-repository.interface";

@injectable()
export class StartPomodoroUsecase {
  constructor(
    @inject("IPomodoroRepository")
    private readonly pomodoroRepository: IPomodoroRepository,
  ) {}

  async execute(userId: string, durationMinutes: number, taskId?: string) {
    await this.pomodoroRepository.start({
      userId,
      durationMinutes,
      taskId,
    });
  }
}
