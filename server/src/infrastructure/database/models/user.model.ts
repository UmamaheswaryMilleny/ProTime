import mongoose,{Document,Model} from "mongoose";
import { UserSchema } from "../schema/user.schema";
import { AuthProvider,UserRole } from "../../../domain/enums/user.enums";

export interface UserDocument extends Document{
    fullName:string;
    email:string;
    passwordHash?:string;
    role:UserRole;
    authProvider:AuthProvider;
    googleId?:string;
    isEmailVerified:boolean;
    isBlocked:boolean;
    isDeleted:boolean;
    createdAt:Date;
    updatedAt:Date;
}

// A Model represents:One MongoDB collection + all operations on it
// Check if a model called User already exists in Mongoose.||Create a new model called User using UserSchema.”
export const UserModel:Model<UserDocument>= mongoose.models.User || mongoose.model<UserDocument>("User",UserSchema)