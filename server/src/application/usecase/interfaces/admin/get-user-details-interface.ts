import type { UserResponseDTO } from "../../../dto/response/user-response-dto.js";

export interface IGetUserDetailsUsecase {
  execute(userId: string): Promise<UserResponseDTO>;
}



