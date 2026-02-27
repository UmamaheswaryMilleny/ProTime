import type { ITaskEntity } from "../../entities/task.entity.js";
import type { IBaseRepository } from "../baseRepository-interface.js";

export interface ITaskRepository
  extends IBaseRepository<ITaskEntity> {

  countCompletedToday(userId: string): Promise<number>;

  countCompletedTodayByPriority(
    userId: string,
    priority: "low" | "medium" | "high"
  ): Promise<number>;

  findActiveTasks(userId: string): Promise<ITaskEntity[]>;
}
