// import { SuccessResponseDTO } from "../../../dto/response/success.response.dto"
export interface IforgotPasswordUseCase{
    execute(email:string):Promise<void>
}


