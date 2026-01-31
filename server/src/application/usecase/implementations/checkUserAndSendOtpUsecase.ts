import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from '../../../domain/repositoryInterface/user/user-repository-interface.js';
import type { IOtpService } from '../../../domain/service-interfaces/otp-service-interface.js';
import { ValidationError } from '../../../domain/errors/validationError.js';
import { eventBus } from '../../../shared/eventBus.js';
import { mailContentProvider } from '../../../shared/mailContentProvider.js';
import type { ICheckUserAndSendOtpUsecase } from '../interfaces/check-user-verify-usecase-interface.js';
import { MAIL_CONTENT_PURPOSE } from '../../../shared/constants/constants.js';
import type { ITempUserService } from '../../../domain/service-interfaces/temp-user-service-interface.js';

@injectable()
export class CheckUserAndSendOtpUsecase implements ICheckUserAndSendOtpUsecase {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,

    @inject('IOtpService')
    private _otpService: IOtpService,

    @inject('ITempUserService')
    private _tempUserService: ITempUserService,
  ) {}

  async execute(data: { email: string}): Promise<void> {
    const { email } = data;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const tempUser = await this._tempUserService.getUser(email);
    console.log('Temp User:', tempUser);
    if (!tempUser) {
      throw new ValidationError('User not registered. Call /register first.');
    }


    
    const existingEmail = await this._userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ValidationError('Email already exists');
    }

    // ✅ Check if OTP already exists
const existingOtp = await this._otpService.getOtp(email);
if (existingOtp) {
  throw new ValidationError("OTP already sent. Please verify.");
}
    const otp = this._otpService.generateOtp();
    await this._otpService.storeOtp(email, otp);
    // await this._tempUserService.storeUser(email, data);

    console.log(otp, '-->otp');
    eventBus.emit(
      'SENDMAIL',
      email,
      'OTP Verification',
      mailContentProvider(MAIL_CONTENT_PURPOSE.OTP, otp),
    );
  }
}
