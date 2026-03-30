import { Router } from 'express';
import * as inventoryController from './inventory.controller';
import { stockAdjustmentSchema, expiryQuerySchema, lowStockQuerySchema } from './inventory.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to list all inventory batches (Authenticated)
 */
router.get('/', protect, inventoryController.getInventory);

/**
 * Route to get expiring products (Authenticated)
 */
router.get('/expiring', protect, validate(expiryQuerySchema), inventoryController.getExpiringProducts);

/**
 * Route to get low stock products (Authenticated)
 */
router.get('/low-stock', protect, validate(lowStockQuerySchema), inventoryController.getLowStockProducts);

/**
 * Route to get inventory for a specific product (Authenticated)
 */
router.get('/product/:id', protect, inventoryController.getInventoryByProduct);

/**
 * Route to create a stock adjustment (ADMIN only)
 */
router.post('/adjustments', protect, authorize(UserRole.ADMIN), validate(stockAdjustmentSchema), inventoryController.createAdjustment);

/**
 * Route to list adjustment history (ADMIN only)
 */
router.get('/adjustments', protect, authorize(UserRole.ADMIN), inventoryController.getAdjustmentHistory);

export default router;
