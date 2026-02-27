import { inject, injectable } from "tsyringe";
import type { ICompleteTaskUsecase } from "../interfaces/complete-task-usecase.interface";
import type { ITaskRepository } from "../../../domain/repositoryInterface/task/task-repository.interface";
import type { IXpService } from "../../../domain/service-interfaces/xp-service.interface";

@injectable()
export class CompleteTaskUsecase implements ICompleteTaskUsecase {
  constructor(
    @inject("ITaskRepository")
    private readonly taskRepository: ITaskRepository,

    @inject("IXpService")
    private readonly xpService: IXpService,
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    if (task.isCompleted) return;

    await this.taskRepository.markCompleted(taskId);

    // 🎯 XP calculation handled centrally
    await this.xpService.handleTaskCompletion(userId, task);
  }
}
