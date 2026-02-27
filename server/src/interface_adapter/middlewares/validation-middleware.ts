import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../../shared/constants/constants.js';

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
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

export const validationMiddleware = <T extends object>(
  dtoClass: ClassConstructor<T>,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: Record<string, unknown> = {};
      if (req.body && Object.keys(req.body).length > 0)
        Object.assign(data, req.body);
      if (
        req.method !== 'PUT' &&
        req.method !== 'PATCH' &&
        req.method !== 'POST'
      ) {
        if (req.params && Object.keys(req.params).length > 0)
          Object.assign(data, req.params);
      }
      if (req.query && Object.keys(req.query).length > 0)
        Object.assign(data, req.query);

      const dtoObj = plainToInstance(dtoClass, data);
      const errors = await validate(dtoObj, {
        whitelist: true,
        forbidNonWhitelisted: true,
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
    } catch (error) {
      console.error('Validation Middleware Error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal validation error',
      });
      return;
    }
  };
};
