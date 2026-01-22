import { UserMapper } from "../../../application/mapper/user-mapper.js";
import type { IUserEntity } from "../../../domain/entities/user.js";
import type { IUserRepository } from "../../../domain/repositoryInterface/user/user-repository-interface.js";
import { userDB } from "../../database/models/client-model.js";
import type { IUserModel } from "../../database/models/client-model.js";
import { BaseRepository } from "../baseRepository.js";
import type { SortOrder } from "mongoose";

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


  async updateBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    const result = await userDB.updateOne({ _id: id }, { $set: { isBlocked } });

    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }
  }

  async findAllWithSearch(
    page: number,
    limit: number,
    search?: string,
    status: "all" | "blocked" | "unblocked" = "all",
    sort: string = "createdAt",
    order: "asc" | "desc" = "asc"
  ): Promise<{ users: IUserEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const matchConditions: Record<string, unknown> = { role: "client" };

    // Apply status filter
    if (status === "blocked") {
      matchConditions.isBlocked = true;
    } else if (status === "unblocked") {
      matchConditions.isBlocked = false;
    }
    // If status is "all", no filter is applied

    // Apply search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      matchConditions.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },

      ];
    }

    // Build sort object
    const sortField = sort || "createdAt";

    const sortOrder: SortOrder = order === "desc" ? -1 : 1;

    const sortObject: Record<string, SortOrder> = {
      [sortField]: sortOrder,
    };

    const [users, total] = await Promise.all([
      userDB
        .find(matchConditions)
        .skip(skip)
        .limit(limit)
        .sort(sortObject)
        .exec(),
      userDB.countDocuments(matchConditions),
    ]);

    return {
      users: users.map((user) => UserMapper.toEntity(user)),
      total,
    };
  }

  async findById(userId: string): Promise<IUserEntity | null> {
    const user = await userDB.findById(userId);
    if (!user) return null;
    return UserMapper.toEntity(user);
  }

  async updatePassword(
    id: string,
    newPassword: string
  ): Promise<IUserEntity | null> {
    return await userDB.findByIdAndUpdate(
      id,
      {
        $set: { password: newPassword },
      },
      { new: true }
    );
  }


}