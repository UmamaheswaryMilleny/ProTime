import { UserMapper } from "../../../application/mapper/user-mapper.js";
import type { IUserEntity } from "../../../domain/entities/user.js";
import type { IUserRepository } from "../../../domain/repositoryInterface/user/user-repository-interface.js";
import { userDB } from "../../database/models/client-model.js";
import type { IUserModel } from "../../database/models/client-model.js";
import { BaseRepository } from "../baseRepository.js";

export class UserRepository
  extends BaseRepository<IUserModel, IUserEntity>
  implements IUserRepository
{
  constructor() {
    super(userDB, UserMapper.toEntity);
  }
  async findByEmail(email: string): Promise<IUserEntity | null> {
    return await userDB.findOne({ email });
  }


  
}