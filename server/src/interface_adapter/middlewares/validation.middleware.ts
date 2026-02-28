import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../../shared/constants/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively flattens nested class-validator errors into a flat list
 * so we can extract the first meaningful message easily
 */
function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = ''
): { property: string; constraints: Record<string, string> }[] {
  return errors.flatMap((error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const currentErrors = error.constraints
      ? [{ property: path, constraints: error.constraints }]
      : [];

    const childErrors = error.children
      ? flattenValidationErrors(error.children, path)
      : [];

    return [...currentErrors, ...childErrors];
  });
}

type ClassConstructor<T = object> = new (...args: unknown[]) => T;

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * validationMiddleware — validates incoming request data against a DTO class
 *
 * Merges body + params + query into one object then validates against the DTO.
 * Params and query are only merged for non-mutating methods (GET, DELETE).
 * Returns the first validation error message as a 400 response.
 *
 * Usage:
 *   router.post('/register', validationMiddleware(RegisterRequestDTO), handler)
 *   router.get('/users',     validationMiddleware(GetUsersRequestDTO), handler)
 */
export const validationMiddleware = <T extends object>(
  dtoClass: ClassConstructor<T>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: Record<string, unknown> = {};

      // Always merge body
      if (req.body && Object.keys(req.body).length > 0) {
        Object.assign(data, req.body);
      }

      // Merge params and query only for non-mutating methods
      if (
        req.method !== 'POST' &&
        req.method !== 'PUT' &&
        req.method !== 'PATCH'
      ) {
        if (req.params && Object.keys(req.params).length > 0) {
          Object.assign(data, req.params);
        }
      }

      if (req.query && Object.keys(req.query).length > 0) {
        Object.assign(data, req.query);
      }

      const dtoObj = plainToInstance(dtoClass, data);

      const errors = await validate(dtoObj, {
        whitelist: true,           // strip unknown properties
        forbidNonWhitelisted: true, // error on unknown properties
      });

      if (errors.length > 0) {
        const detailedErrors = flattenValidationErrors(errors);
        const firstError = detailedErrors[0];
        const firstMessage = firstError
          ? Object.values(firstError.constraints)[0]
          : 'Validation failed';

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: firstMessage,
        });
        return;
      }

      next();
    } catch {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal validation error',
      });
    }
  };
};