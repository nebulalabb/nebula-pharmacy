import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { errorResponse } from '../utils/response';

/**
 * Authorize route for specific roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Not authorized to access this route', 403);
    }
    next();
  };
};
