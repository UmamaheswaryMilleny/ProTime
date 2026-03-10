import type { TodoListResponseDTO } from "../../../dto/todo/response/todolist-response.dto";

export interface IGetTodosUsecase {
  execute(userId: string, filter?: 'all' | 'pending' | 'completed'|'expired'): Promise<TodoListResponseDTO>;
}