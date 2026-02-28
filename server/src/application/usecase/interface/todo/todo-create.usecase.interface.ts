import type { CreateTodoRequestDTO } from '../../../dto/todo/request/todo.create.request.dto';
import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';

export interface ICreateTodoUsecase {
  execute(userId: string, data: CreateTodoRequestDTO): Promise<TodoResponseDTO>;
}
