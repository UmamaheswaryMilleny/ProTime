import { inject, injectable } from "tsyringe";
import type { ICompleteTodoUsecase } from "../../interface/todo/todo.complete.usecase.interface";
import type { ITodoRepository } from "../../../../domain/repositories/todo/todo.repository.interface";
import type { IGamificationRepository } from "../../../../domain/repositories/gamification/gamification.repository.interface";
import type { IAwardXpUsecase } from "../../interface/gamification/award-xp.usecase.interface";
import { TodoMapper } from "../../../mapper/todo.mapper";
import type { CompleteTodoResponseDTO, TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";
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
import { TodoExpiredError } from "../../../../domain/errors/todo.error";
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
  ): Promise<CompleteTodoResponseDTO> {
    // 1. Find the todo
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError();

    // 2. Ownership check
    if (todo.userId !== userId) throw new UnauthorizedTodoAccessError();

    // 3. Already completed?
    if (todo.status === TodoStatus.COMPLETED) throw new TodoAlreadyCompletedError();
    if (todo.status === TodoStatus.EXPIRED) throw new TodoExpiredError();
    // 4. Check daily XP cap — read from gamification entity 
    const gamification = await this.gamificationRepository.findByUserId(userId);
    if (!gamification) throw new GamificationNotFoundError();


    // 5. Calculate XP
    const potentialBonusXp = todo.pomodoroCompleted
      ? POMODORO_BONUS_XP[todo.priority]
      : 0;

    const potentialTotalXp = todo.baseXp + potentialBonusXp;

    // remaining daily cap
    const remainingCap = Math.max(0, DAILY_XP_CAP - gamification.dailyXpEarned);
    const xpToAward = Math.min(potentialTotalXp, remainingCap);


    const bonusXp = Math.max(0, xpToAward - todo.baseXp);
    const xpCounted = xpToAward > 0;

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



    const source: XpSource =
      todo.priority === TodoPriority.HIGH ? 'TODO_HIGH'
        : todo.priority === TodoPriority.MEDIUM ? 'TODO_MEDIUM'
          : 'TODO_LOW';

    const xpResult = await this.awardXpUsecase.execute({
      userId,
      xp: xpToAward,
      isPremium,
      source,
      todoId,
    });


    return {
        todo: TodoMapper.toResponse(updated),
        xpResult
    };
  }
}