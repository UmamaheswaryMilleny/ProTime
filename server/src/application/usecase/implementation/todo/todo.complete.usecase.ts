import { inject, injectable } from "tsyringe";
import type { ICompleteTodoUsecase } from "../../interface/todo/todo.complete.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import type { IGamificationRepository } from "../../../../domain/repositories/gamification/gamification.repository.interface";
import type { IAwardXpUsecase } from "../../interface/gamification/award-xp.usecase.interface";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";
import { TodoMapper } from "../../../mapper/todo.mapper";
import {
  TodoStatus,
  TodoPriority,
  POMODORO_BONUS_XP,
  DAILY_XP_CAP,
} from "../../../../domain/enums/todo.enums";

import { XpSource } from "../../../../domain/enums/gamification.enums";
import {
  TodoNotFoundError,
  UnauthorizedTodoAccessError,
  TodoAlreadyCompletedError,
} from "../../../../domain/errors/todo.error";
import { GamificationNotFoundError } from "../../../../domain/errors/gamification.error";
import { TodoExpiredError, TodoPomodoroNotCompletedError } from "../../../../domain/errors/todo.error";
@injectable()
export class CompleteTodoUsecase implements ICompleteTodoUsecase {
  constructor(
    @inject("ITodoRepository")
    private readonly todoRepository: ITodoRepository,

    @inject("IGamificationRepository")
    private readonly gamificationRepository: IGamificationRepository,

    @inject("IAwardXpUsecase")
    private readonly awardXpUsecase: IAwardXpUsecase,
  ) { }

  async execute(
    userId: string,
    todoId: string,
    isPremium: boolean,
  ): Promise<TodoResponseDTO> {
    // 1. Find the todo
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();

    // 2. Ownership check
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    // 3. Already completed?
    if (todo.status === TodoStatus.COMPLETED) throw new TodoAlreadyCompletedError();
    if (todo.status === TodoStatus.EXPIRED) throw new TodoExpiredError();

    // ─── Pomodoro Enhancement ────────────────────────────────────────────────
    // If pomodoro is enabled, it MUST be completed before the todo can be closed
    if (todo.pomodoroEnabled && !todo.pomodoroCompleted) {
      throw new TodoPomodoroNotCompletedError();
    }
    // 4. Check daily XP cap — read from gamification entity (single source of truth)
    const gamification = await this.gamificationRepository.findByUserId(userId);
    if (!gamification) throw new GamificationNotFoundError();
    const capReached = gamification.dailyXpEarned >= DAILY_XP_CAP;

    // 5. Calculate XP
    // If cap reached → bonusXp = 0, xpCounted = false (task still completes)
    const bonusXp = capReached
      ? 0
      : todo.pomodoroCompleted
        ? POMODORO_BONUS_XP[todo.priority]
        : 0;

    const xpCounted = !capReached;

    // 6. Update todo to COMPLETED
    const updated = await this.todoRepository.updateById(todoId, {
      status: TodoStatus.COMPLETED,
      completedAt: new Date(),
      bonusXp,      // baseXp stays as set at creation
      xpCounted,
    });
    if (!updated) throw new TodoNotFoundError();

    // 7. Award XP to gamification — runs even if cap hit (xp=0)
    //    streak + badge checks always run regardless of cap
    const xpToAward = xpCounted ? todo.baseXp + bonusXp : 0;

    const source: XpSource =
      todo.priority === TodoPriority.HIGH ? 'TODO_HIGH'
        : todo.priority === TodoPriority.MEDIUM ? 'TODO_MEDIUM'
          : 'TODO_LOW';

    await this.awardXpUsecase.execute({
      userId,
      xp: xpToAward,
      isPremium,
      source,
      todoId,
    });

    // 8. Increment daily XP counter — only if XP was actually awarded
    // if (xpToAward > 0) {
    //   await this.gamificationRepository.incrementDailyXpEarned(userId, xpToAward);
    // }

    return TodoMapper.toResponse(updated);
  }
}