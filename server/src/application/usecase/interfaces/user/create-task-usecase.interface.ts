import type { TaskResponseDTO } from "../../../dto/response/task-response.dto.js";
import type { CreateTaskRequestDTO } from "../../../dto/request/createtask-reqeust.dto.js";

export interface ICreateTaskUsecase {
  execute(userId: string, data: CreateTaskRequestDTO): Promise<TaskResponseDTO>;
}
