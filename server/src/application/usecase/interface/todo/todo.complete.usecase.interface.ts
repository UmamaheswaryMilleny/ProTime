import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';

export interface ICompleteTodoUsecase {
  execute(userId: string, todoId: string,isPremium:boolean): Promise<TodoResponseDTO>;
}
