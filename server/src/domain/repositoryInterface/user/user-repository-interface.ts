import type { IUserEntity } from "../../../domain/entities/user.js";
import type { IBaseRepository } from "../baseRepository-interface.js";

export interface IUserRepository extends IBaseRepository<IUserEntity> {
  findByEmail(email: string): Promise<IUserEntity | null>;




}
