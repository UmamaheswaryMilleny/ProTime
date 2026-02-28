import { inject, injectable } from "tsyringe";
import type { IOtpService } from "../../service_interface/otp.service.interface";
import type { ITempUserService } from "../../service_interface/temp-user.service.interface";
import type { IVerifyOtpUsecase } from "../interface/auth/verify-otp.usecase.interface";
import { InvalidOtpError } from "../../../domain/errors/user.error";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface";
import { AuthProvider } from "../../../domain/enums/user.enums";
import type { IProfileRepository } from "../../../domain/repositories/profile/profile.repository.interface";


@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUsecase {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,
    @inject("ITempUserService")
    private readonly tempUserService: ITempUserService,
    @inject("IOtpService")
    private readonly otpService: IOtpService,
       @inject("ProfileRepository")
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(data: { email: string; otp: string }): Promise<void> {
    const { email, otp } = data;

    // 1. verify OTP
    let isValid = await this.otpService.verifyOtp({ email, otp });
    if (!isValid) throw new InvalidOtpError();

    //2. Load Temo User
    const tempUser = await this.tempUserService.getUser(email);
    if (!tempUser) throw new InvalidOtpError();

    
    //3. create real user entity
    const user =   await this.userRepository.save({
      email,
      fullName: tempUser.fullName,
      passwordHash: tempUser.passwordHash,
      authProvider: AuthProvider.LOCAL,
      role: tempUser.role,
      isEmailVerified: true,
      isBlocked: false,
      isDeleted: false,
    })


        // 4. Create profile for this user  ← ADD THIS
    await this.profileRepository.save({
      userId: user.id,
      fullName: tempUser.fullName,
      username: email.split('@')[0],  // default username from email
    });


    //4. clean up temp data
    await this.tempUserService.deleteUser(email);
    await this.otpService.deleteOtp(email);
  }
}
