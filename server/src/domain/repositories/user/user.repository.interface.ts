import type { UserEntity } from "../../entities/user.entity";
import type { IBaseRepository } from "../base.repository.interface";

export interface IUserRepository extends IBaseRepository<UserEntity> {

  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleID(id:string):Promise<UserEntity|null>
  updatePassword(id:string,hashedPassword:string):Promise<void>
  updateBlockStatus(id:string,isBlocked:boolean):Promise<void>
  findAllWithSearch(
    page: number,
    limit: number,
    search?: string,
    status?: "all" | "blocked" | "unblocked",
    sort?: string,
    order?: "asc" | "desc"
  ): Promise<{ users: UserEntity[]; total: number }>;

}




