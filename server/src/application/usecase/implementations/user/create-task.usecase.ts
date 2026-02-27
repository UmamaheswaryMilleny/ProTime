import { inject, injectable } from "tsyringe";
import type { ITaskRepository } from "../../../domain/repositoryInterface/task/task-repository.interface";
import type { ICreateTaskUsecase } from "../interfaces/create-task-usecase.interface";
import type { CreateTaskRequestDTO } from "../../../application/dto/request/create-task-request.dto";
import { TaskMapper } from "../../mapper/task-mapper";
import { ValidationError } from "../../../domain/errors/validationError";

@injectable()
export class CreateTaskUsecase implements ICreateTaskUsecase {
  constructor(
    @inject("ITaskRepository")
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, data: CreateTaskRequestDTO) {
    if (!userId) throw new ValidationError("User required");

    const task = await this.taskRepository.create({
      ...data,
      userId,
      isCompleted: false,
    });

    return TaskMapper.toResponseDTO(task);
  }
}
