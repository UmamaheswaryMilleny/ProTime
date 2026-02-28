export interface IDeleteTodoUsecase {
  execute(userId: string, todoId: string): Promise<void>;
}
