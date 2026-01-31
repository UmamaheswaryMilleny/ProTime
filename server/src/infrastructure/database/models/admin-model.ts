import mongoose, { Document } from "mongoose";
import type { IAdminEntity } from "../../../domain/entities/admin-entity.js";
import { adminSchema } from "../schemas/admin-schema.js";

export interface IAdminModel
// “Use all fields from domain entity except _id”
  extends Omit<IAdminEntity, "_id">,
    Document {}

export const adminDB = mongoose.model<IAdminModel>(
  "admins",
  adminSchema
);