import { inject, injectable } from "tsyringe";
import type { IDeleteTodoUsecase } from "../../interface/todo/todo.delete.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
}  from "../../../../domain/errors/todo.error";


@injectable()
export class DeleteTodoUsecase implements IDeleteTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) {}
  async execute(userId: string, todoId: string): Promise<void> {
    // 1. Find the todo
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();

    // 2. Ownership check — prevents IDOR attacks
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    // 3. Delete
    await this.todoRepository.deleteById(todoId);
  }
}