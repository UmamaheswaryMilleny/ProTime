import { inject, injectable } from "tsyringe";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import type { IOtpService } from "../../../../domain/service-interfaces/otp-service-interface.js";

@injectable()
export class VerifyOtpUsecase {
  constructor(
    @inject("IOtpService") private _otpService: IOtpService
  ) {}

  async execute(email: string, otp: string) {
    const isValid = await this._otpService.verifyOtp({ email, otp });

    if (!isValid) {
      throw new ValidationError("Invalid OTP");
    }

    return {
      success: true,
      message: "OTP Verified",
    };
  }
}