import { injectable } from "tsyringe";
import type {
  IGoogleAuthService,
  GoogleUserInfo,
} from "../../domain/service-interfaces/google-auth-service-interface.js";
import { CustomError } from "../../domain/errors/customError.js";
import { HTTP_STATUS } from "../../shared/constants/constants.js";

@injectable()
export class GoogleAuthService implements IGoogleAuthService {
  async verifyToken(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new CustomError(
          HTTP_STATUS.BAD_REQUEST,
          "Invalid Google access token"
        );
      }

      const data = await response.json();

      if (!data.email) {
        throw new CustomError(
          HTTP_STATUS.BAD_REQUEST,
          "Google account email not found"
        );
      }

      return {
        email: data.email,
        name: data.name || "",
        picture: data.picture,
        sub: data.sub,
      };
    } catch {
      throw new CustomError(
        HTTP_STATUS.BAD_REQUEST,
        "Invalid or expired Google access token"
      );
    }
  }
}