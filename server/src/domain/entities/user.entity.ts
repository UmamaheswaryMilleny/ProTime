import { AuthProvider, UserRole } from "../enums/user.enums.js"

export interface UserEntity{
    id:string
    fullName:string
    email:string
    isEmailVerified:boolean
    passwordHash: string
    role: UserRole
    authProvider:AuthProvider
    isBlocked:boolean
    isDeleted:boolean
    createdAt:Date
    updatedAt:Date  
}