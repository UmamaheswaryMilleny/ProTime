import 'reflect-metadata';
import { ServiceRegistry } from './service.registry.js';
import { UsecaseRegistry } from './usecase.registry.js';

/**
 * Main DI bootstrap — call this ONCE at app startup before anything else.
 * Order matters: services must be registered before use cases that depend on them.
 */
export class DependencyContainer {
  static registerAll(): void {
    ServiceRegistry.register();   // 1. Repos + services first
    UsecaseRegistry.register();   // 2. Use cases second (they depend on services)
  }
}