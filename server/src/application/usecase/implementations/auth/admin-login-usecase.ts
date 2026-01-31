import { inject, injectable } from 'tsyringe';
import type { ILoginUsecase } from '../../interfaces/auth/loginUsecase-interface.js';
import type { IUserRepository } from '../../../../domain/repositoryInterface/user/user-repository-interface.js';
import { AdminLoginRequestDTO } from '../../../dto/request/adminlogin-request-dto.js';
import type { BaseLoginRequest } from '../../../dto/request/base-login-request-dto.js';
import type { LoginResponseDTO } from '../../../dto/response/login-response-dto.js';
import { NotFoundError } from '../../../../domain/errors/notFoundError.js';
import { ValidationError } from '../../../../domain/errors/validationError.js';
import { ERROR_MESSAGE } from '../../../../shared/constants/constants.js';
import { comparePassword } from '../../../../shared/utils/bcryptHelper.js';
import { UserMapper } from '../../../mapper/user-mapper.js';

@injectable()
export class AdminLoginUsecase implements ILoginUsecase {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
  ) {}

  async execute(data: BaseLoginRequest): Promise<LoginResponseDTO> {
    // Type assertion to AdminLoginRequestDTO for internal validation if needed
    const adminLoginData = data as AdminLoginRequestDTO;
    const admin = await this._userRepository.findByEmail(adminLoginData.email);
    if (!admin) {
      throw new NotFoundError(ERROR_MESSAGE.AUTHENTICATION.EMAIL_NOT_FOUND);
    }

    if (admin.role !== 'admin') {
      throw new ValidationError(ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ROLE);
    }



    const isPasswordMatch = await comparePassword(
      adminLoginData.password,
      admin.password,
    );

    if (!isPasswordMatch) {
      throw new ValidationError(
        ERROR_MESSAGE.AUTHENTICATION.PASSWORD_INCORRECT,
      );
    }

    return UserMapper.mapToLoginResponseDto(admin);
  }
}
