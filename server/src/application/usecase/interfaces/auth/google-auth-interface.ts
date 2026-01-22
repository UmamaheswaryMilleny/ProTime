import type{ LoginResponseDTO } from "../../../dto/response/login-response-dto.js";

export interface IGoogleAuthUsecase {
  execute(idToken: string): Promise<LoginResponseDTO>;
}
