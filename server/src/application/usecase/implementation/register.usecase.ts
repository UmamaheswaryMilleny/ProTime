import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface.js";
import type { IRegisterUsecase } from "../interface/auth/register.usecase.interface.js";
import { UserAlreadyExistsError } from "../../../domain/errors/user.error.js";
import type { IPasswordHasherService } from "../../service_interface/password-hasher.service.interface.js";
import type { ITempUserService } from "../../service_interface/temp-user.service.interface.js";
import type { IEmailService } from "../../service_interface/email.service.interface.js";
import type { IOtpService } from "../../service_interface/otp.service.interface.js";
import { UserRole } from "../../../domain/enums/user.enums.js";
import { mailContentProvider } from "../../../shared/mailContentProvider.js";
import { MAIL_CONTENT_PURPOSE } from "../../../shared/constants/constants.js";

@injectable()
export class RegisterUsecase implements IRegisterUsecase {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,
    @inject("ITempUserService")
    private readonly tempUserService: ITempUserService,
    @inject("IOtpService")
    private readonly otpService: IOtpService,
    @inject("IEmailService")
    private readonly emailService: IEmailService,
    @inject("IPasswordHasherService")
    private readonly passwordHasherService: IPasswordHasherService,
  ) {}
  async execute(data: {
    fullName:string;
    email: string;
    password: string;
  }): Promise<void> {
    const {fullName, email, password } = data;

    //1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    // 2. Hash password Before storing anywhere
    const passwordHash = await this.passwordHasherService.hash(password);

    //3.  Store temporary user
    await this.tempUserService.storeUser(email, {
      fullName,
      passwordHash,
      role: UserRole.CLIENT,

    },
     60 * 5 // 5 minutes
  );
    // 4. Generate OTP
    const otp = this.otpService.generateOtp();

    // 5. Send OTP email
    await this.otpService.storeOtp(email, otp, 60 * 5);

    await this.emailService.sendMail(
      email,
      "Verify your ProTime account",
      mailContentProvider(MAIL_CONTENT_PURPOSE.OTP, otp),
    );
  
  }
}
