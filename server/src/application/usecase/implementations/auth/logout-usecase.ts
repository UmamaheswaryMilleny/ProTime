import { injectable } from "tsyringe";
import type { ILogoutUseCase } from "../../interfaces/auth/logout-usecase-interface.js";
// This logout use case exists to keep the architecture consistent; it currently does nothing because logout logic (cookies/tokens) is handled in the controller layer.
@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  async execute(): Promise<void> {

    return Promise.resolve();
  }
}



