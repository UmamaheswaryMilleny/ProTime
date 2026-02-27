import { inject, injectable } from "tsyringe";
import type { ICheckUserBlockedUsecase } from "../../interfaces/user/check-user-blocked-usecase.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";


@injectable()
export class CheckUserBlockedUsecase implements ICheckUserBlockedUsecase {
  constructor(
    @inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string, role: string): Promise<boolean> {
    // Admins are never blocked
    if (role === "admin") {
      return false;
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user.isBlocked;
  }
}