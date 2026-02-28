import { inject, injectable } from "tsyringe";
import type { IGetTodosUsecase } from "../../interface/todo/todos-get.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import type { TodoListResponseDTO } from "../../../dto/todo/response/todo.response.dto";
import { TodoMapper } from "../../../mapper/todo.mapper";

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