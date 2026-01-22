import type { IUserEntity } from "./user.js"
export interface IAdminEntity extends IUserEntity{
    role:"admin";
}