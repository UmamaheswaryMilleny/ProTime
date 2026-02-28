import type { SuccessResponseDTO } from "../../../dto/common/success.response.dto";

export interface IRegisterUsecase{
   execute(data: {fullName:string, email: string; password: string }): Promise<void>;

}

