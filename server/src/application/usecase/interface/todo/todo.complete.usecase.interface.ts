import type { TodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';

export interface ICompleteTodoUsecase {
  //isPremium — controls XP calculation. Premium users get higher streak bonus XP:
  execute(userId: string, todoId: string, isPremium: boolean): Promise<TodoResponseDTO>;
  //Returns TodoResponseDTO — the updated todo so the frontend can immediately reflect the completed state without needing a separate fetch.
}
