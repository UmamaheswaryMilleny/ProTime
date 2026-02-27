import { injectable, inject } from "tsyringe";
import type { ILogoutUseCase } from "../interface/auth/logout.usecase.interface.js";
import type { SuccessResponseDTO } from "../../dto/common/success.response.dto.js";
import type { IRefreshTokenStore } from "../../service_interface/refresh-token-store-service.interface.js";
import type { ITokenService } from "../../service_interface/token.service.interface.js";
import { InvalidTokenError } from "../../../domain/errors/user.error.js";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @inject("IRefreshTokenStore")
    private readonly refreshtokenstore: IRefreshTokenStore,
    @inject("ITokenService")
    private readonly tokenService: ITokenService,
  ) {}
  async execute(refreshToken: string): Promise<SuccessResponseDTO> {
    //1. Verify refresh token
    const payload = this.tokenService.verifyRefresh(refreshToken);

    if(!payload || !payload.id){
      throw new InvalidTokenError()
    }
   

    //2. Delete refresh token
    await this.refreshtokenstore.delete(payload.id, refreshToken);

    return {
      success: true,
      message: "Logout successfully",
    };
  }
}


