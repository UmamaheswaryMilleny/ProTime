import { inject, injectable } from "tsyringe";
import { eventBus } from "../../../../shared/eventBus.js";
import { mailContentProvider } from "../../../../shared/mailContentProvider.js";
import type { IOtpService } from "../../../../domain/service-interfaces/otp-service-interface.js";
import { MAIL_CONTENT_PURPOSE } from "../../../../shared/constants/constants.js";

@injectable()
export class ResendOtpUsecase {
  constructor(
    @inject("IOtpService") private _otpService: IOtpService
  ) {}

  async execute(email: string): Promise<void> {
    await this._otpService.deleteOtp(email);

    const otp = this._otpService.generateOtp();
    await this._otpService.storeOtp(email, otp);
    console.log("otp--->",otp)

    eventBus.emit(
      "SENDMAIL",
      email,
      "OTP Resend",
      mailContentProvider(MAIL_CONTENT_PURPOSE.OTP, otp)
    );
  }
}