import mongoose, { Document} from "mongoose";
import type { IUserEntity } from "../../../domain/entities/user.js";
import { userSchema } from "../schemas/user-schema.js";

export interface IUserModel extends Omit<IUserEntity, "_id">, Document {
  
}

export const userDB = mongoose.model<IUserModel>("users", userSchema);