import type { RefreshTokenResponseDTO } from "../../../dto/auth/response/refrsh-token.response.dto";

export interface IRefreshTokenUsecase {
  execute(refreshToken: string): Promise<RefreshTokenResponseDTO>;
}

// export interface IRefreshTokenUsecase {
//   execute(refreshToken: string): Promise<{ role: string; accessToken: string; userId: string; email: string }>;
// }

