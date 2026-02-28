import { inject, injectable } from "tsyringe";
import type { ITempUserService } from "../../service_interface/temp-user.service.interface";
import type { IEmailService } from "../../service_interface/email.service.interface";
import type { IOtpService } from "../../service_interface/otp.service.interface";
import { mailContentProvider } from "../../../shared/mailContentProvider";
import type { ISendOtpUsecase } from "../interface/auth/send-otp.usecase.interface";
import { MAIL_CONTENT_PURPOSE } from "../../../shared/constants/constants";
// import { InvalidOtpError } from "../../../domain/errors/user.error";
import { RegistrationSessionExpiredError } from "../../../domain/errors/user.error";

@injectable()
export class ResendOtpUseCase implements ISendOtpUsecase {
  constructor(
    @inject("ITempUserService")
    private readonly tempUserPort: ITempUserService,
    @inject("IOtpService")
    private readonly otpPort: IOtpService,
    @inject("IEmailService")
    private readonly emailPort: IEmailService,
  ) {}

  async execute(email: string): Promise<void> {
    //1. Ensure pending registration exists
    const tempUser = await this.tempUserPort.getUser(email);
    if (!tempUser) {
      throw new RegistrationSessionExpiredError()
    }

    //2. Generate new OTP
    const otp = this.otpPort.generateOtp();

    //3. Store OTP (overite previous)
    await this.otpPort.storeOtp(email, otp, 60 * 5);

    //4. Send OTP email
    await this.emailPort.sendMail(
      email,
      "Verify your ProTime account",
      mailContentProvider(MAIL_CONTENT_PURPOSE.OTP, otp),
    );
  }
}
