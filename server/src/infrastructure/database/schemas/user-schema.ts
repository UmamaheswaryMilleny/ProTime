import mongoose from "mongoose";
import type { IUserModel } from "../models/client-model.js";
// import { GENDER, ROLES } from "../../../shared/constants"; 

export const userSchema = new mongoose.Schema<IUserModel>(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      default: null,
    },

    location: {
      type: String,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["client","admin"],
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
);