import { inject, injectable } from "tsyringe";
import type { IMarkExpiredTodosUsecase } from "../../interface/todo/mark-expired-todos.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";

@injectable()
export class MarkExpiredTodosUsecase implements IMarkExpiredTodosUsecase {
    constructor(
        @inject("ITodoRepository")
        private readonly todoRepository: ITodoRepository,
    ) { }

    async execute(): Promise<void> {
        await this.todoRepository.markExpiredTodos();
    }
}
