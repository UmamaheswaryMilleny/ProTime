export interface ProfileEntity{
    userId:string
    fullName:string
    username:string
    bio?:string
    country?:string
    languages?:string[]
    profileImage?:string
    createdAt:Date
    updatedAt:Date
}