import { Schema } from "mongoose";
import { UserRole, AuthProvider } from "../../../domain/enums/user.enums.js";

export const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),//This field is allowed to store ONLY these values.
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, //allows LOCAL users without googleId
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);
