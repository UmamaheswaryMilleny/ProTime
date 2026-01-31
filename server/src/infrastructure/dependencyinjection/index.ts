import { RepositoryRegister } from "./repository-register.js";
import { UsecaseRegistory } from "./usecase-register.js";
// Before the app starts, register every dependency needed by the application.Call all registration in one place”
export class DependencyInjection {
  static registerAll(): void {
    UsecaseRegistory.registerUsecase();
    RepositoryRegister.registerRepository();
  }
}

