import type { IPomodoroSessionEntity } from "../../entities/pomodoro-session.entity.js";
import type { IBaseRepository } from "../baseRepository-interface.js";

export interface IPomodoroRepository
  extends IBaseRepository<IPomodoroSessionEntity> {

  findCompletedToday(userId: string): Promise<IPomodoroSessionEntity[]>;

  totalFocusMinutesToday(userId: string): Promise<number>;
}
