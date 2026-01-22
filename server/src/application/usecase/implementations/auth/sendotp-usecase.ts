import { inject, injectable } from "tsyringe";
import type { IOtpService } from "../../../../domain/service-interfaces/otp-service-interface.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import { eventBus } from "../../../../shared/eventBus.js";
import { mailContentProvider } from "../../../../shared/mailContentProvider.js";

@injectable()
export class SendOtpUsecase {
  constructor(
    @inject("IOtpService") private _otpService: IOtpService
  ) {}

  async execute(email: string): Promise<void> {
    if (!email) {
      throw new ValidationError("Email is required");
    }
  
    const otp = this._otpService.generateOtp();
    await this._otpService.storeOtp(email, otp);
    console.log(otp)

    eventBus.emit(
      "SENDMAIL",
      email,
      "OTP Verification",
      mailContentProvider("OTP", otp)
    );
  }
}