import { inject, injectable } from "tsyringe";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import { ERROR_MESSAGE } from "../../../../shared/constants/constants.js";
import type { CurrentUserResponseDTO } from "../../../dto/response/current-user-response-dto.js";
import type { IGetCurrentUserUsecase } from "../../interfaces/auth/get-current-user-interface.js";

@injectable()
export class GetCurrentUserUsecase implements IGetCurrentUserUsecase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<CurrentUserResponseDTO> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGE.USER.NOT_FOUND);
    }

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }
}



