import mongoose from "mongoose";
import { ROLES } from "../../../shared/constants/constants.js";
import type { IAdminModel } from "../models/admin-model.js";
export const adminSchema=new mongoose.Schema<IAdminModel>(
      {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "admin",
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)