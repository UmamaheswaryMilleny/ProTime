import type { LoginResponseDTO } from "../../../dto/auth/response/login.response.dto"

export interface IGoogleAuthUsecase{
    execute(idToken:string):Promise<LoginResponseDTO>
}