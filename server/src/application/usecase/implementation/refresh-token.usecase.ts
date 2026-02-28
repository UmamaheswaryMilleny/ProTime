import { inject, injectable } from "tsyringe";
import type { ITokenService } from "../../service_interface/token.service.interface";
import type { IRefreshTokenUsecase } from "../interface/auth/refresh-token.usecase.interface";
import type { RefreshTokenResponseDTO } from "../../dto/auth/response/refrsh-token.response.dto";
import { InvalidTokenError } from "../../../domain/errors/user.error";
import type { IRefreshTokenStore } from "../../service_interface/refresh-token-store-service.interface";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUsecase {
  constructor(
@inject("ITokenService")
private tokenPort: ITokenService,
    @inject("IRefreshTokenStore")
    private refreshTokenStore: IRefreshTokenStore,
       @inject("UserRepository")
    private userRepository: IUserRepository
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResponseDTO> {
    //1. validate input
    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    // 2. verify refresh token
    const payload = this.tokenPort.verifyRefresh(refreshToken);
    if (!payload) {
      throw new InvalidTokenError();
    }

    //3. check refresh token exist in redis
    const isValid = await this.refreshTokenStore.exists(payload.id, refreshToken);

    if (!isValid) {
      throw new InvalidTokenError();
    }

    // if(!payload.id || !payload.email || !payload.role){
    //   throw new InvalidTokenError()
    // }



    // const newPayload = {
    //   id: payload.id,
    //   email: payload.email,
    //   role: payload.role,
    // };

    //4. Load User

    const user = await this.userRepository.findById(payload.id)

    if(!user || user.isBlocked || user.isDeleted){
      throw new InvalidTokenError()
    }
    //4. generate new access token
    const accessToken = this.tokenPort.generateAccess({id:user.id,email:user.email,role:user.role});

    //5. return new access token

    return {
      accessToken,
    };
  }
}
