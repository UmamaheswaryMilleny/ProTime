import { inject, injectable } from "tsyringe";
import type { IGetTodosUsecase } from "../../interface/todo/todos-get.usecase.interface.js";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface.js";
import type { TodoListResponseDTO } from "../../../dto/todo/response/todo.response.dto.js";
import { TodoMapper } from "../../../mapper/todo.mapper.js";

@injectable()
export class GetTodosUsecase implements IGetTodosUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) {}

  async execute(
    userId: string,
    filter: "all" | "pending" | "completed" = "all"
  ): Promise<TodoListResponseDTO> {
    const todos = await this.todoRepository.findByUserId(userId, filter);

    // ✅ Fixed: now fetches todayXp and passes it to mapper
    // Previously todayXp was never fetched so the XP bar had no data
    const todayXp = await this.todoRepository.getTotalXpEarnedToday(userId);

    return TodoMapper.toListResponse(todos, todayXp);
  }
}