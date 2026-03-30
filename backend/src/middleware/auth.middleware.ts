import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

/**
 * Protect route with JWT verification
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token provided', 401);
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Not authorized, token invalid', 401);
    }

    // Pass the decoded payload (user info) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token verification failed', 401);
  }
};
