import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import  type{ IBlockUnblockUserUsecase } from "../../interfaces/admin/blockUnblock-interface.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";

@injectable()
export class BlockUnblockUserUsecase implements IBlockUnblockUserUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository
  ) {}

  async execute(userId: string, isBlocked: boolean): Promise<void> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this._userRepository.updateBlockStatus(userId, isBlocked);
  }
}