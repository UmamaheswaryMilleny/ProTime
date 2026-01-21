import type { IUserEntity } from "../../../../domain/entities/user.js";

export interface IRegisterUsecase{
    execute(data : Partial<IUserEntity>) : Promise<void>;
}