import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { UserRole } from '@prisma/client';
import { errorResponse } from '../utils/response';

/**
 * Validate request using Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return errorResponse(res, 'Validation Error', 400, error.issues);
      }
      return errorResponse(res, 'Internal Server Error during validation', 500);
    }
  };
};
