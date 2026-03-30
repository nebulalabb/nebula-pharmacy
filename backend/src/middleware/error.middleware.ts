import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error stack for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error Stack:', err.stack);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    status,
    process.env.NODE_ENV === 'development' ? { stack: err.stack, ...err } : null
  );
};
