import { inject, injectable } from "tsyringe";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import type { IOtpService } from "../../../../domain/service-interfaces/otp-service-interface.js";
import type { IVerifyOtpAndCreateUserUsecase } from "../../interfaces/auth/verify-otp-user_usecase-interface.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import { hashPassword } from "../../../../shared/utils/bcryptHelper.js";
import type { ITempUserService } from "../../../../domain/service-interfaces/temp-user-service-interface.js";

@injectable()
export class VerifyOtpAndCreateUserUsecase
  implements IVerifyOtpAndCreateUserUsecase
{
  constructor(
    @inject("IOtpService")
    private _otpService: IOtpService,

    @inject("IUserRepository")
    private _userRepository: IUserRepository,

    @inject("ITempUserService")
private _tempUserService: ITempUserService,

  ) {}

  async execute(
    email: string,
    otp: string,
    // userData: {
    //   firstName: string;
    //   lastName: string;
    //   password: string;
    // }
  ): Promise<void> {
    const isValid = await this._otpService.verifyOtp({ email, otp });
    if (!isValid) {
      throw new ValidationError("Invalid OTP");
    }
const userData = await this._tempUserService.getUser(email);
console.log("Temp User:", userData);
if (!userData) {
  throw new ValidationError("Signup expired. Please register again.");
}

    await this._otpService.deleteOtp(email);

    const hashedPassword = await hashPassword(userData.password);
const existing = await this._userRepository.findByEmail(email);
if (existing) {
  throw new ValidationError("User already created.");
}

    await this._userRepository.save({
      ...userData,
      email,
      password : hashedPassword,
      isBlocked: false,
    });
    await this._tempUserService.deleteUser(email);

  }
  
}