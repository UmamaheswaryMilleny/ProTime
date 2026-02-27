import { inject, injectable } from "tsyringe";
import type { IBuddyMatchRepository } from "../../../domain/repositoryInterface/buddy/buddy-match-repository.interface";

@injectable()
export class AcceptBuddyRequestUsecase implements IAcceptBuddyRequestUsecase {
  constructor(
    @inject("IBuddyMatchRepository")
    private readonly repo: IBuddyMatchRepository
  ) {}

  async execute(requestId: string, userId: string): Promise<void> {
    await this.repo.acceptRequest(requestId, userId);
  }
}
