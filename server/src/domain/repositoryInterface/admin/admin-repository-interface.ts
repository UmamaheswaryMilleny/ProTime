import type { IBaseRepository } from "../baseRepository-interface.js";
import type { IAdminEntity } from "../../entities/admin-entity.js";

export interface IAdminRepository
  extends IBaseRepository<IAdminEntity> {
  findByEmail(email: string): Promise<IAdminEntity | null>;
  updatePassword(id: string, newPassword: string): Promise<IAdminEntity | null>;
}