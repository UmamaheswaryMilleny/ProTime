import { inject, injectable } from "tsyringe";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import type { IOtpService } from "../../../../domain/service-interfaces/otp-service-interface.js";
import type { IVerifyOtpAndCreateUserUsecase } from "../../interfaces/auth/verify-otp-user_usecase-interface.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import { hashPassword } from "../../../../shared/utils/bcryptHelper.js";

@injectable()
export class VerifyOtpAndCreateUserUsecase
  implements IVerifyOtpAndCreateUserUsecase
{
  constructor(
    @inject("IOtpService")
    private _otpService: IOtpService,

    @inject("IUserRepository")
    private _userRepository: IUserRepository
  ) {}

  async execute(
    email: string,
    otp: string,
    userData: {
      firstName: string;
      lastName: string;
      password: string;
      phone: string;
    }
  ): Promise<void> {
    const isValid = await this._otpService.verifyOtp({ email, otp });
    if (!isValid) {
      throw new ValidationError("Invalid OTP");
    }

    await this._otpService.deleteOtp(email);

    const hashedPassword = await hashPassword(userData.password);

    await this._userRepository.save({
      ...userData,
      email,
      password : hashedPassword,
      isBlocked: false,
    });
  }
}