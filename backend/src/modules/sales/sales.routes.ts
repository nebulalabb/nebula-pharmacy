import { Router } from 'express';
import * as salesController from './sales.controller';
import { createSalesOrderSchema } from './sales.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

/**
 * Route to list all sales history (Authenticated)
 */
router.get('/', protect, salesController.getAllSalesOrders);

/**
 * Route to get sale detail by ID (Authenticated)
 */
router.get('/:id', protect, salesController.getSalesOrderById);

/**
 * Route to create a new sale (POS) (Authenticated)
 */
router.post('/', protect, validate(createSalesOrderSchema), salesController.createSalesOrder);

export default router;
