import { Router } from 'express';

/**
 * BaseRoute — abstract base for all route classes
 * Each route class extends this and implements initializeRoutes()
 */
export abstract class BaseRoute {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  protected abstract initializeRoutes(): void;
}