import { injectable } from "tsyringe";
import type { ILogoutUseCase } from "../../interfaces/auth/logout-usecase-interface.js";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  async execute(): Promise<void> {
    // Logout logic is handled at the controller level (cookie clearing)
    // This usecase exists for consistency with Clean Architecture
    // Future: Could add token blacklisting, session invalidation, etc.
    return Promise.resolve();
  }
}



