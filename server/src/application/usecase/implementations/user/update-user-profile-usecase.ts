import { inject, injectable } from "tsyringe";
import type  { IUpdateUserProfileUsecase } from "../../interfaces/user/update-user-profile-interface.js";
import { UpdateUserProfileRequestDTO } from "../../../dto/request/update-userprofile-request.dto.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import type { IUserEntity } from "../../../../domain/entities/user.js";
import { ERROR_MESSAGE } from "../../../../shared/constants/constants.js";


@injectable()
export class UpdateUserProfileUsecase implements IUpdateUserProfileUsecase {
  constructor(
    @inject("IUserRepository")
    private readonly _userRepository: IUserRepository
  ) {}

  async execute(
    userId: string,
    data: UpdateUserProfileRequestDTO
  ): Promise<IUserEntity> {
    // Verify user exists
    const existingUser = await this._userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError(ERROR_MESSAGE.USER.NOT_FOUND);
    }

    
    const updateData: Partial<IUserEntity> = {};
    
    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName.trim();
    }

  
    if (data.bio !== undefined) {
      updateData.bio = data.bio.trim() || undefined;
    }
    if (data.profileImage !== undefined) {
      updateData.profileImage = data.profileImage || undefined;
    }

   
    const updatedUser = await this._userRepository.updateById(userId, updateData);
    
    if (!updatedUser) {
      throw new NotFoundError(ERROR_MESSAGE.USER.NOT_FOUND_AFTER_UPDATE);
    }

    return updatedUser;
  }
}