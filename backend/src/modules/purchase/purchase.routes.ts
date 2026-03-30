import { Router } from 'express';
import * as purchaseController from './purchase.controller';
import { createPurchaseSchema } from './purchase.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to list all purchase orders (Authenticated)
 */
router.get('/', protect, purchaseController.getAllPurchaseOrders);

/**
 * Route to get purchase order by ID (Authenticated)
 */
router.get('/:id', protect, purchaseController.getPurchaseOrderById);

/**
 * Route to create a new purchase order (ADMIN only)
 */
router.post('/', protect, authorize(UserRole.ADMIN), validate(createPurchaseSchema), purchaseController.createPurchaseOrder);

/**
 * Route to cancel (delete) a purchase order (ADMIN only)
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), purchaseController.deletePurchaseOrder);

export default router;
