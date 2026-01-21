import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IOtpService } from "../../../domain/service-interfaces/otp-service-interface.js";
import { ValidationError } from "../../../domain/errors/validationError.js";
import { eventBus } from "../../../shared/eventBus.js";
import { mailContentProvider } from "../../../shared/mailContentProvider.js";
import type { ICheckUserAndSendOtpUsecase } from "../interfaces/check-user-verify-usecase-interface.js";
import { MAIL_CONTENT_PURPOSE } from "../../../shared/constants/constants.js";

@injectable()
export class CheckUserAndSendOtpUsecase implements ICheckUserAndSendOtpUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository,

    @inject("IOtpService")
    private _otpService: IOtpService
  ) {}

  async execute(data: {
    email: string;
    phone: string;
  }): Promise<void> {
    const { email } = data;

    if (!email ) {
      throw new ValidationError("Email is required");
    }

    const existingEmail = await this._userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ValidationError("Email already exists");
    }



    const otp = this._otpService.generateOtp();
    await this._otpService.storeOtp(email, otp);
    console.log(otp,"-->otp")
    eventBus.emit(
      "SENDMAIL",
      email,
      "OTP Verification",
      mailContentProvider(MAIL_CONTENT_PURPOSE.OTP, otp)
    );
  }
}