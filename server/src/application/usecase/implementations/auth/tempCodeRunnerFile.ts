import { inject, injectable } from 'tsyringe';
import type { IUserEntity } from '../../../../domain/entities/user.js';
import type { IUserRepository } from '../../../../domain/repositoryInterface/user/user-repository-interface.js';
import { hashPassword } from '../../../../shared/utils/bcryptHelper.js';
import type { IRegisterUsecase } from '../../interfaces/auth/register-usecase-interface.js';
import type { ITempUserService } from '../../../../domain/service-interfaces/temp-user-service-interface.js';

@injectable()
export class RegisterUsecase implements IRegisterUsecase {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('ITempUserService')
    private _tempUserService: ITempUserService,
  ) {}

  async execute(data: Partial<IUserEntity>): Promise<void> {
    if (!data.email || !data.password) {
      throw new Error('email and password required');
    }
    console.log('Register storing temp user:', data.email);

    const isEmailExists = await this._userRepository.findByEmail(data.email);
    if (isEmailExists) {
      throw new Error('email already exists');
    }

    // Store RAW password in Redis TEMP
    await this._tempUserService.storeUser(data.email, data);

    // DO NOT hash password
    // DO NOT save in MongoDB
  }

  // async execute(data: Partial<IUserEntity>): Promise<void> {
  //   if (!data.email ) {
  //     throw new Error("email is required");
  //   }

  //   const isEmailExists = await this._userRepository.findByEmail(data.email);

  //   if (isEmailExists) {
  //     throw new Error("email already exists");
  //   }

  //   const hashedPassword = await hashPassword(data.password!);

  //   const dataToSave: Partial<IUserEntity> = {
  //     ...data,
  //     password: hashedPassword,
  //   };

  //   // await this._userRepository.save(dataToSave);
  //   throw new Error("Direct register disabled. Use OTP signup.");

  // }
}
