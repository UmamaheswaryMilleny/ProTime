import { inject, injectable } from "tsyringe";
import type { ILoginUsecase } from "../../interfaces/auth/loginUsecase-interface.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import { LoginRequestDTO } from "../../../dto/request/login-request-dto.js";
import type { BaseLoginRequest } from "../../../dto/request/base-login-request-dto.js";
import {type  LoginResponseDTO } from "../../../dto/response/login-response-dto.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";
import {
  ERROR_MESSAGE,
  MAIL_CONTENT_PURPOSE,
} from "../../../../shared/constants/constants.js";
import { comparePassword, hashPassword } from "../../../../shared/utils/bcryptHelper.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import { UserMapper } from "../../../mapper/user-mapper.js"
import type { IEmailService } from "../../../../domain/service-interfaces/email-service-interface.js";
import { mailContentProvider } from "../../../../shared/mailContentProvider.js";

@injectable()
export class LoginUsecase implements ILoginUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository,

    @inject("IEmailService")
    private _emailService: IEmailService
  ) {}

  async execute(data: BaseLoginRequest): Promise<LoginResponseDTO> {

    const isEmailExist = await this._userRepository.findByEmail(data.email);
   
    if (!isEmailExist) {
      throw new NotFoundError(ERROR_MESSAGE.AUTHENTICATION.EMAIL_NOT_FOUND);
    }

    const isPasswordMatch = await comparePassword(
       data.password,
       isEmailExist.password
    );

 
    // console.log(data.password,"-------->userpassword")
    // console.log(isEmailExist.password,"-------->dbpassword")

    //  console.log(isPasswordMatch,"----->password")
    if (!isPasswordMatch) {
      throw new ValidationError(
        ERROR_MESSAGE.AUTHENTICATION.PASSWORD_INCORRECT
      );
    }

    if (isEmailExist.isBlocked) {
      throw new ValidationError("Your account has been blocked. Please contact support.");
    }


    return UserMapper.mapToLoginResponseDto(isEmailExist);
  }
}
                                                                             