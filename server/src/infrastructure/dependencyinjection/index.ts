import { RepositoryRegister } from "./repository-register.js";
import { UsecaseRegistory } from "./usecase-register.js";

export class DependencyInjection {
  static registerAll(): void {
    UsecaseRegistory.registerUsecase();
    RepositoryRegister.registerRepository();
  }
}

