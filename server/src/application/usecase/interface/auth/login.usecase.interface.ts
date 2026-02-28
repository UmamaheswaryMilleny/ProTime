
import type { LoginResponseDTO } from "../../../dto/auth/response/login.response.dto";

export interface ILoginUsecase {
  execute(data: {email:string,password:string}): Promise<LoginResponseDTO>;
}


