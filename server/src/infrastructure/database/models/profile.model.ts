import mongoose, { Document, Model, Types } from "mongoose";
import { ProfileSchema } from "../schema/profile.schema";
export interface ProfileDocument extends Document {
  userId: Types.ObjectId;
  fullName: string;
  username: string;
  bio?: string | null;
  country?: string | null;
  languages?: string[];
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ProfileModel: Model<ProfileDocument> =
  mongoose.models.Profile ||
  mongoose.model<ProfileDocument>("Profile", ProfileSchema);
