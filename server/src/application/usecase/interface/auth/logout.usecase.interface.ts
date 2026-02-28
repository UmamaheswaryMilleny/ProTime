import type { SuccessResponseDTO } from "../../../dto/common/success.response.dto"; 
// export interface ILogoutUseCase{
//     execute():Promise<SuccessResponseDTO>;
// }

export interface ILogoutUseCase {
  execute(refreshToken: string): Promise<SuccessResponseDTO>;
}
