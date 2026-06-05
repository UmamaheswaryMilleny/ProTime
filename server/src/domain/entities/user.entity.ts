import { AuthProvider, UserRole } from "../enums/user.enums"

export interface UserEntity{
    id:string
    fullName:string
    email:string
    isEmailVerified:boolean
    passwordHash: string
    role: UserRole
    authProvider:AuthProvider
    isBlocked:boolean
    blockedUntil?: Date | null   // null = permanent block; Date = auto-expires at this time
    isDeleted:boolean
    isPremium: boolean
    googleId?: string
    createdAt: Date
    updatedAt:Date  
}