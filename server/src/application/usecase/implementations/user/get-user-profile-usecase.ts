import { inject, injectable } from "tsyringe";
import type{ IUserEntity } from "../../../../domain/entities/user.js";
import { CustomError } from "../../../../domain/errors/customError.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import {
  ERROR_MESSAGE,
  HTTP_STATUS,
} from "../../../../shared/constants/constants.js";
import type { IGetUserProfileUsecase } from "../../interfaces/user/get-user-profile-usecase-interface.js";

@injectable()
export class GetUserProfileUsecase implements IGetUserProfileUsecase {
  constructor(
    @inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<IUserEntity> {
    if (!userId) {
      throw new CustomError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.AUTHENTICATION.USER_TYPE_AND_ID_REQUIRED
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new CustomError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGE.AUTHENTICATION.USER_NOT_FOUND
      );
    }

    return user;
  }
}