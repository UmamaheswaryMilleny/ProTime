import { injectable } from "tsyringe";
import type { SortOrder } from "mongoose";

import { BaseRepository } from "../base.repository";
import { UserModel, type UserDocument } from "../../database/models/user.model";
import { UserMapper } from "../../database/mappers/user.mapper";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface";
import type { UserEntity } from "../../../domain/entities/user.entity";
import { UserRole } from "../../../domain/enums/user.enums";

@injectable()
export class MongoUserRepository
  extends BaseRepository<UserDocument, UserEntity>
  implements IUserRepository
{
  constructor() {
    super(
      UserModel,
      UserMapper.toDomain,
      // toModel: cast through unknown for type safety
      (data) =>
        UserMapper.toPersistence(data) as unknown as Partial<UserDocument>,
    );
  }

  // ─── IUserRepository Methods ───────────────────────────────────────────────

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.model
      .findOne({ email: email.toLowerCase().trim(), isDeleted: false })
      .exec();

    if (!doc) return null;

    return UserMapper.toDomain(doc);
  }

  async findByGoogleID(googleId: string): Promise<UserEntity | null> {
    // googleId is schema-only — not on UserEntity, queried directly here
    const doc = await this.model.findOne({ googleId, isDeleted: false }).exec();

    if (!doc) return null;

    return UserMapper.toDomain(doc);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.model
      .updateOne(
        { _id: id },
        { $set: { passwordHash: hashedPassword, updatedAt: new Date() } },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new Error(`User with id ${id} not found`);
    }
  }

  async updateBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    const result = await this.model
      .updateOne({ _id: id }, { $set: { isBlocked, updatedAt: new Date() } })
      .exec();

    if (result.matchedCount === 0) {
      throw new Error(`User with id ${id} not found`);
    }
  }

  async findAllWithSearch(
    page: number,
    limit: number,
    search?: string,
    status: "all" | "blocked" | "unblocked" = "all",
    sort: string = "createdAt",
    order: "asc" | "desc" = "asc",
  ): Promise<{ users: UserEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    // Base filter — always exclude deleted users and admins
    const filter: Record<string, unknown> = {
      isDeleted: false,
      role: UserRole.CLIENT,
    };

    // Status filter
    if (status === "blocked") filter.isBlocked = true;
    if (status === "unblocked") filter.isBlocked = false;

    // Search — matches against fullname or email
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ fullName: regex }, { email: regex }];
    }

    // Sort direction
    const sortOrder: SortOrder = order === "desc" ? -1 : 1;

    // Run query and count in parallel
    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ [sort]: sortOrder })
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      users: docs.map((doc) => UserMapper.toDomain(doc)),
      total,
    };
  }
}
