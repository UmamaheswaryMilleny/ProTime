import type { SuccessResponseDTO } from "../../../dto/common/success.response.dto.js";

export interface IRegisterUsecase{
   execute(data: {fullName:string, email: string; password: string }): Promise<void>;

}

