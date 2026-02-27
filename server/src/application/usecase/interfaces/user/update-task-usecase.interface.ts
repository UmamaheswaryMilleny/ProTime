import type { TaskResponseDTO } from "../../../dto/response/task-response.dto.js";
import type { UpdateTaskRequestDTO } from "../../../dto/request/updateTask-request.dto.js";

export interface IUpdateTaskUsecase {
  execute(taskId: string, userId: string, data: UpdateTaskRequestDTO): Promise<TaskResponseDTO>;
}
