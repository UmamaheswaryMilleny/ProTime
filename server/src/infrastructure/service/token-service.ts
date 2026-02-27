import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { injectable } from "tsyringe";

import {
  ITokenService,
  RefreshTokenPayload,
  ResetTokenPayload,
  AccessTokenPayload,
} from "../../application/service_interface/token.service.interface";
import { config } from "../../shared/config";

@injectable()
export class JwtTokenService implements ITokenService {
  generateAccess(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn as SignOptions["expiresIn"],
    });
  }

  generateRefresh(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"], //It only silences TypeScript’s complaint
    });
  }

  generateReset(payload: ResetTokenPayload): string {
    return jwt.sign(payload, config.jwt.resetSecret, {
      expiresIn: config.jwt.resetExpiresIn as SignOptions["expiresIn"],
    });
  }

  verifyAccess(token: string): AccessTokenPayload | null {
    return this.verify<AccessTokenPayload>(token, config.jwt.accessSecret, [
      "id",
      "email",
      "role",
    ]);
  }

  verifyRefresh(token: string): RefreshTokenPayload | null {
    return this.verify<RefreshTokenPayload>(token, config.jwt.refreshSecret, [
      "id",
    ]);
  }

  verifyReset(token: string): ResetTokenPayload | null {
    return this.verify<ResetTokenPayload>(token, config.jwt.resetSecret, [
      "id",
      "email",
      "role",
    ]);
  }


  //This method exists to reuse common verification logic internally and is kept private so only safe, specific methods (verifyAccess, verifyRefresh, verifyReset) are exposed.
  private verify<T extends object>(
    token: string,
    secret: string,
    requiredFields: (keyof T)[],
  ): T | null {
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;

      if (typeof decoded !== "object") return null;

      for (const field of requiredFields) {
        if (!(field in decoded)) return null;
      }

      return decoded as T;
    } catch {
      return null;
    }
  }
}
