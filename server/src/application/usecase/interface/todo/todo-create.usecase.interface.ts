import type { CreateTodoRequestDTO } from '../../../dto/todo/request/todo.create.request.dto.js';
import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto.js';

export interface ICreateTodoUsecase {
  execute(userId: string, data: CreateTodoRequestDTO): Promise<TodoResponseDTO>;
}
