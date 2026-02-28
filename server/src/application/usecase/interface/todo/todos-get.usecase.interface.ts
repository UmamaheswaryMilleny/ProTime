import type { TodoListResponeDTO } from "../../../dto/todo/response/todo.response.dto.js";

export interface IGetTodosUsecase {
  execute(userId: string, filter?: 'all' | 'pending' | 'completed'): Promise<TodoListResponeDTO>;
}