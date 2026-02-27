import type { SuccessResponseDTO } from "../../../dto/common/success.response.dto.js"; 
// export interface ILogoutUseCase{
//     execute():Promise<SuccessResponseDTO>;
// }

export interface ILogoutUseCase {
  execute(refreshToken: string): Promise<SuccessResponseDTO>;
}
