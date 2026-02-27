import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../../domain/errors/customError.js";
import type { ITokenService } from "../../../../domain/service-interfaces/token-service-interfaces.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../../../../shared/constants/constants.js";
import type { IRefreshTokenUsecase } from "../../interfaces/auth/refresh-token-usecase-interface.js";
import type  { JwtPayload } from "jsonwebtoken";
// “When the access token expires, create a NEW access token using a refresh token
interface RefreshTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

@injectable()
export class RefreshTokenUsecase implements IRefreshTokenUsecase {
  constructor(
    @inject("ITokenService")
    private _tokenService: ITokenService
  ) {}

  async execute(
    refreshToken: string
  ): Promise<{ role: string; accessToken: string; userId: string; email: string }> {
    if (!refreshToken || refreshToken.trim() === "") {
      throw new CustomError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGE.AUTHENTICATION.TOKEN_MISSING
      );
    }

    const payload = this._tokenService.verifyRefreshToken(refreshToken) as RefreshTokenPayload | null;

    if (!payload || !payload.id || !payload.email || !payload.role) {
      throw new CustomError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGE.AUTHENTICATION.TOKEN_EXPIRED_REFRESH
      );
    }

    const newPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    const accessToken = this._tokenService.generateAccessToken(newPayload);

    return {
      role: payload.role,
      accessToken,
      userId: payload.id,
      email: payload.email,
    };
  }
}