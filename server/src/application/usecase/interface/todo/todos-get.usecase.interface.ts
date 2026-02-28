import type { TodoListResponseDTO } from "../../../dto/todo/response/todo.response.dto";

export interface IGetTodosUsecase {
  execute(userId: string, filter?: 'all' | 'pending' | 'completed'): Promise<TodoListResponseDTO>;
}