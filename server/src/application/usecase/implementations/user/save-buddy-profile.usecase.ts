import { inject, injectable } from "tsyringe";
import type { IBuddyProfileRepository } from "../../../domain/repositoryInterface/buddy/buddy-profile-repository.interface";

@injectable()
export class SaveBuddyProfileUsecase {
  constructor(
    @inject("IBuddyProfileRepository")
    private readonly repo: IBuddyProfileRepository,
  ) {}

  async execute(userId: string, data: any) {
    await this.repo.saveOrUpdate(userId, data);
  }
}
