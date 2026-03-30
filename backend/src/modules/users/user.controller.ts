import { Request, Response } from 'express';
import * as userService from './user.service';
import { successResponse, errorResponse } from '../../utils/response';
import { hashPassword } from '../../utils/password';

/**
 * List all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.listAll();
    return successResponse(res, users, 'Users listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing users', 500, error.message);
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    // Hash password
    const hashedPassword = await hashPassword(password);

    // Save to DB
    const user = await userService.create({
      name,
      email,
      passwordHash: hashedPassword,
      role,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return successResponse(res, userWithoutPassword, 'User created successfully', 201);
  } catch (error: any) {
    // Handle unique constraint (email)
    if (error.code === 'P2002') {
      return errorResponse(res, 'Email already exists', 400);
    }
    return errorResponse(res, 'Error creating user', 500, error.message);
  }
};

/**
 * Update user information
 */
export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = req.body;

  try {
    const updatedUser = await userService.update(id, data);
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return successResponse(res, userWithoutPassword, 'User updated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error updating user', 500, error.message);
  }
};

/**
 * Soft delete (Disable) user
 */
export const disableUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const currentUserId = (req.user as any).id;

  if (id === currentUserId) {
    return errorResponse(res, 'Cannot disable your own account', 400);
  }

  try {
    await userService.softDelete(id);
    return successResponse(res, null, 'User disabled successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error disabling user', 500, error.message);
  }
};
