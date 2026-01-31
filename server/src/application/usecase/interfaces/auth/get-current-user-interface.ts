import type { CurrentUserResponseDTO } from "../../../dto/response/current-user-response-dto.js";

export interface IGetCurrentUserUsecase {
  execute(userId: string): Promise<CurrentUserResponseDTO>;
}



