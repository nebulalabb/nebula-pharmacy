import { Router } from 'express';
import * as supplierController from './supplier.controller';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to list all suppliers (Authenticated)
 */
router.get('/', protect, supplierController.getAllSuppliers);

/**
 * Route to get supplier by ID (Authenticated)
 */
router.get('/:id', protect, supplierController.getSupplierById);

/**
 * Route to create a new supplier (ADMIN only)
 */
router.post('/', protect, authorize(UserRole.ADMIN), validate(createSupplierSchema), supplierController.createSupplier);

/**
 * Route to update a supplier (ADMIN only)
 */
router.put('/:id', protect, authorize(UserRole.ADMIN), validate(updateSupplierSchema), supplierController.updateSupplier);

/**
 * Route to disable a supplier (ADMIN only)
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), supplierController.disableSupplier);

export default router;
