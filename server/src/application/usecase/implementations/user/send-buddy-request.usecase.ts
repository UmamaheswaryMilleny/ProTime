import { inject, injectable } from "tsyringe";
import type { IBuddyMatchRepository } from "../../../domain/repositoryInterface/buddy/buddy-match-repository.interface";

@injectable()
export class SendBuddyRequestUsecase {
  constructor(
    @inject("IBuddyMatchRepository")
    private readonly repo: IBuddyMatchRepository,
  ) {}

  async execute(senderId: string, receiverId: string) {
    await this.repo.createRequest(senderId, receiverId);
  }
}
