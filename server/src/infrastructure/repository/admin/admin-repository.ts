import { injectable } from "tsyringe";
import type  { IAdminEntity } from "../../../domain/entities/admin-entity.js";
import type { IAdminRepository } from "../../../domain/repositoryInterface/admin/admin-repository-interface.js";
import { adminDB } from "../../database/models/admin-model.js";
import type { IAdminModel } from "../../database/models/admin-model.js";
import { BaseRepository } from "../baseRepository.js";
@injectable()
export class AdminRepository extends BaseRepository<IAdminModel, IAdminEntity>
  implements IAdminRepository
{
  constructor() {
    super(adminDB);
  }

  async findByEmail(email: string): Promise<IAdminEntity | null> {
    
    const admin = await adminDB.findOne({ email }).exec();
    return admin as unknown as IAdminEntity;
  }



 
}