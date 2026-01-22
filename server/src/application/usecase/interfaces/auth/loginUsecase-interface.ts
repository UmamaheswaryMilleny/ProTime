import type { BaseLoginRequest } from "../../../dto/request/base-login-request-dto.js";
import type { LoginResponseDTO } from "../../../dto/response/login-response-dto.js";

export interface ILoginUsecase {
  execute(data: BaseLoginRequest): Promise<LoginResponseDTO>;
}