
import type { LoginResponseDTO } from "../../../dto/auth/response/login.response.dto.js";

export interface ILoginUsecase {
  execute(data: {email:string,password:string}): Promise<LoginResponseDTO>;
}


