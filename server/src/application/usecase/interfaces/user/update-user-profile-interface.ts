import type { IUserEntity } from "../../../../domain/entities/user.js";
import { UpdateUserProfileRequestDTO } from "../../../dto/request/update-userprofile-request.dto.js";

export interface IUpdateUserProfileUsecase {
  execute(
    userId: string,
    data: UpdateUserProfileRequestDTO
  ): Promise<IUserEntity>;
}