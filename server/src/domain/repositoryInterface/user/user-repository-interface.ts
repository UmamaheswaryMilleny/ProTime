import type { IUserEntity } from "../../../domain/entities/user.js";
import type { IBaseRepository } from "../baseRepository-interface.js";

export interface IUserRepository extends IBaseRepository<IUserEntity> {
  // findByEmail(email: string): Promise<IUserEnti>;
  findByName(email:string):Promise<IUserEntity>
  updatePassword(id: string, newPassword: string): Promise<IUserEntity | null>;
  updateBlockStatus(
    userId: string,
    isBlocked: boolean
  ): Promise<void>;

  findAllWithSearch(
    page: number,
    limit: number,
    search?: string,
    status?: "all" | "blocked" | "unblocked",
    sort?: string,
    order?: "asc" | "desc"
  ): Promise<{ users: IUserEntity[]; total: number }>;


}
