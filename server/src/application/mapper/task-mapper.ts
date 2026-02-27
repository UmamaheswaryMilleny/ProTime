import type { ITaskEntity } from "../../domain/entities/task.entity.js"
import type { TaskResponseDTO } from "../dto/response/task-response.dto.js";

export class TaskMapper {
  static toResponseDTO(task: ITaskEntity): TaskResponseDTO {
    return {
      id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes,
      isCompleted: task.isCompleted,
      xpReward: task.xpReward,
      createdAt: task.createdAt,
    };
  }
}
