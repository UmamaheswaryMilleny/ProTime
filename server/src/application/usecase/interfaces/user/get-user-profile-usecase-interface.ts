import type { IUserEntity } from "../../../../domain/entities/user.js";

export interface IGetUserProfileUsecase {
  execute(userId: string): Promise<IUserEntity>;
}