import { inject, injectable } from "tsyringe";

import type { ITokenService } from "../../../../domain/service-interfaces/token-service-interfaces.js";
import type { IGenerateTokenUseCase } from "../../interfaces/auth/generate-token-usecase-interface.js";

@injectable()
export class GenerateTokenUseCase implements IGenerateTokenUseCase {
  constructor(
    @inject("ITokenService")
    private _tokenService: ITokenService
  ) {}

  async execute(
    id: string,
    email: string,
    role: string,
    status?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      id,
      email,
      role,
      ...(status && { status }),
    };

    const accessToken = this._tokenService.generateAccessToken(payload);
    const refreshToken = this._tokenService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
}