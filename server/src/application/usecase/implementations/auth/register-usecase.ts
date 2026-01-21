import { inject, injectable } from "tsyringe";
import type { IUserEntity } from "../../../../domain/entities/user.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import { hashPassword } from "../../../../shared/utils/bcryptHelper.js";
import type { IRegisterUsecase } from "../../interfaces/auth/register-usecase-interface.js";

@injectable()
export class RegisterUsecase implements IRegisterUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository
  ) {}
  async execute(data: Partial<IUserEntity>): Promise<void> {
    if (!data.email ) {
      throw new Error("email is required");
    }

    const isEmailExists = await this._userRepository.findByEmail(data.email);

    if (isEmailExists) {
      throw new Error("email already exists");
    }

 

    const hashedPassword = await hashPassword(data.password!);

    const dataToSave: Partial<IUserEntity> = {
      ...data,
      password: hashedPassword,
    };

    await this._userRepository.save(dataToSave);
  }
}