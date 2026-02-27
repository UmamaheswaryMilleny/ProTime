import type { IXpTransactionEntity } from "../../entities/xp-transaction.entity.js";

export interface IXpTransactionRepository {

  // Record that the user earned XP for some reason
  create(data: IXpTransactionEntity): Promise<void>;

  getTotalXp(userId: string): Promise<number>;

  // How much XP did the user earn during this time range?
  getXpForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number>;
}
