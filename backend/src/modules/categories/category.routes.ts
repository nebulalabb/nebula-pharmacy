import { Router } from 'express';
import * as categoryController from './category.controller';
import { categorySchema } from './category.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to list all categories (Authenticated)
 */
router.get('/', protect, categoryController.getAllCategories);

/**
 * Route to create a new category (ADMIN only)
 */
router.post('/', protect, authorize(UserRole.ADMIN), validate(categorySchema), categoryController.createCategory);

/**
 * Route to update a category (ADMIN only)
 */
router.put('/:id', protect, authorize(UserRole.ADMIN), validate(categorySchema), categoryController.updateCategory);

/**
 * Route to delete a category (ADMIN only)
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), categoryController.deleteCategory);

export default router;
