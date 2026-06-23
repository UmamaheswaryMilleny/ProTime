import { inject, injectable } from "tsyringe";
import type { IGetTodoByIdUsecase } from "../../interface/todo/get-todo-by-id.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import { TodoNotFoundError } from "../../../../domain/errors/todo.error";
import { TodoMapper } from "../../../mapper/todo.mapper";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";

@injectable()
export class GetTodoByIdUsecase implements IGetTodoByIdUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) {}

  async execute(userId: string, todoId: string): Promise<TodoResponseDTO> {
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) {
      throw new TodoNotFoundError();
    }
    return TodoMapper.toResponse(todo);
  }
}
