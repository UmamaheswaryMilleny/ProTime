import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IGetUserDetailsUsecase } from "../../interfaces/admin/get-user-details-interface.js";
import type { UserResponseDTO } from "../../../dto/response/user-response-dto.js";
import { UserMapper } from "../../../mapper/user-mapper.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";

@injectable()
export class GetUserDetailsUsecase implements IGetUserDetailsUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return UserMapper.toUserResponseDto(user);
  }
}



