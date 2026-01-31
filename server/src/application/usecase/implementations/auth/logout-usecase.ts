import { injectable } from "tsyringe";
import type { ILogoutUseCase } from "../../interfaces/auth/logout-usecase-interface.js";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  async execute(): Promise<void> {

    return Promise.resolve();
  }
}



