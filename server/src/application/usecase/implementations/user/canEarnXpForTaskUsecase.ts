import { inject, injectable } from "tsyringe";
import type { ITaskRepository } from "../../../domain/repositoryInterface/task/task-repository.interface";

@injectable()
export class CanEarnXpForTaskUsecase implements ICanEarnXpForTaskUsecase {
  constructor(
    @inject("ITaskRepository")
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute({ userId, priority, date }: {
    userId: string;
    priority: "low" | "medium" | "high";
    date: Date;
  }): Promise<boolean> {
    const stats = await this.taskRepository.getDailyXpStats(userId, date);
    /**
     * stats = {
     *   totalXpTasks: number,
     *   mediumCount: number,
     *   highCount: number
     * }
     */

    if (stats.totalXpTasks >= 10) return false;
    if (priority === "medium" && stats.mediumCount >= 3) return false;
    if (priority === "high" && stats.highCount >= 3) return false;

    return true;
  }
}
