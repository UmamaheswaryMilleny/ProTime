import { inject, injectable } from "tsyringe";
import type { ICompleteTodoUsecase } from "../../interface/todo/todo.complete.usecase.interface.js";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface.js";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto.js";
import { TodoMapper } from "../../../mapper/todo.mapper.js";
import {
  TodoStatus,
  POMODORO_BONUS_XP,
  DAILY_XP_CAP,
}  from "../../../../domain/enums/todo.enums.js";


import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
  TodoAlreadyCompletedError,
}  from "../../../../domain/errors/todo.error.js";



@injectable()
export class CompleteTodoUsecase implements ICompleteTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository
  ) {}

  async execute(userId: string, todoId: string): Promise<TodoResponseDTO> {
    // 1. Find the todo
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();

    // 2. Ownership check
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    // 3. Already completed?
    if (todo.status === TodoStatus.COMPLETED) throw new TodoAlreadyCompletedError();

    // 4. Check daily XP cap
    const totalXpToday = await this.todoRepository.getTotalXpEarnedToday(userId);
    const capReached = totalXpToday >= DAILY_XP_CAP;

    // 5. Calculate XP
    // ✅ Fixed: baseXp already set at creation — do NOT overwrite it
    // Only calculate bonusXp based on pomodoroCompleted flag
    // If cap reached → bonusXp = 0, xpCounted = false (task still completes)
    const bonusXp = capReached
      ? 0
      : todo.pomodoroCompleted
        ? POMODORO_BONUS_XP[todo.priority]
        : 0;

    const xpCounted = !capReached;

    // 6. Update todo to COMPLETED — only update XP-related fields + status
    const updated = await this.todoRepository.updateById(todoId, {
      status: TodoStatus.COMPLETED,
      completedAt: new Date(),
      bonusXp,      // ✅ Only bonusXp updated — baseXp stays as set at creation
      xpCounted,
    } as never);

    if (!updated) throw new TodoNotFoundError();

    return TodoMapper.toResponse(updated);
  }
}