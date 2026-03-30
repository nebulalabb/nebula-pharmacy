import { Router } from 'express';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema } from './user.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to list all users (ADMIN only)
 */
router.get('/', protect, authorize(UserRole.ADMIN), userController.getAllUsers);

/**
 * Route to create a new user (ADMIN only)
 */
router.post('/', protect, authorize(UserRole.ADMIN), validate(createUserSchema), userController.createUser);

/**
 * Route to update user info (ADMIN only)
 */
router.put('/:id', protect, authorize(UserRole.ADMIN), validate(updateUserSchema), userController.updateUser);

/**
 * Route to disable a user (ADMIN only)
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), userController.disableUser);

export default router;
