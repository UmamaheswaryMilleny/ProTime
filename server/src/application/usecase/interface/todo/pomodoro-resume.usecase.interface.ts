import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';

export interface IResumePomodoroUsecase {
  execute(userId: string, todoId: string): Promise<TodoResponseDTO>;
}
