import { inject, injectable } from "tsyringe";
import type { IPomodoroRepository } from "../../../domain/repositoryInterface/pomodoro/pomodoro-repository.interface";
import type { IXpService } from "../../../domain/service-interfaces/xp-service.interface";

@injectable()
export class CompletePomodoroUsecase {
  constructor(
    @inject("IPomodoroRepository")
    private readonly pomodoroRepository: IPomodoroRepository,

    @inject("IXpService")
    private readonly xpService: IXpService,
  ) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    const session = await this.pomodoroRepository.complete(sessionId);

    await this.xpService.handlePomodoroCompletion(userId, session);
  }
}
