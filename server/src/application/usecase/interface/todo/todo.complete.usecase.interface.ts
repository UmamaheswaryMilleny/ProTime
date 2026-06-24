import type { CompleteTodoResponseDTO } from '../../../dto/todo/response/todo.response.dto';

export interface ICompleteTodoUsecase {
  //isPremium — controls XP calculation. Premium users get higher streak bonus XP:
  execute(
    userId: string, 
    todoId: string, 
    isPremium: boolean,
    metadata?: {
      completionType?: 'SOLO' | 'BUDDY' | 'ROOM';
      completedWithBuddyName?: string | null;
      completedInRoomName?: string | null;
    }
  ): Promise<CompleteTodoResponseDTO>;
  //Returns CompleteTodoResponseDTO — includes the updated todo and badge/XP results.
}
