/// <reference path="../../types/express.d.ts" />
import { Request, Response } from 'express';
import * as authService from './auth.service';
import { successResponse, errorResponse } from '../../utils/response';
import { generateToken } from '../../utils/jwt';
import { comparePassword, hashPassword } from '../../utils/password';

/**
 * Controller for Auth login
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findByEmail(email);

    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials or inactive account', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Sign Token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      'Login successful'
    );
  } catch (error: any) {
    return errorResponse(res, 'Login error', 500, error.message);
  }
};

/**
 * Controller for Logout (client side removal of token)
 */
export const logout = async (req: Request, res: Response) => {
  return successResponse(res, null, 'Logged out successfully');
};

/**
 * Controller for Get current user
 */
export const getMe = async (req: Request, res: Response) => {
  return successResponse(res, req.user, 'Current user profile fetched');
};

/**
 * Controller for Change password
 */
export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user!.id;

  try {
    const user = await authService.findByEmail(req.user!.email);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await comparePassword(oldPassword, user.passwordHash);

    if (!isMatch) {
      return errorResponse(res, 'Old password incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update DB
    await authService.updatePassword(userId, hashedPassword);

    return successResponse(res, null, 'Password updated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Change password error', 500, error.message);
  }
};
