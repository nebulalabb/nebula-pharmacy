import { Router } from 'express';
import * as reportsController from './reports.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to get unified dashboard stats (Authenticated)
 */
router.get('/dashboard', protect, reportsController.getDashboard);

/**
 * Route to get revenue report (ADMIN only)
 */
router.get('/revenue', protect, authorize(UserRole.ADMIN), reportsController.getRevenueReport);

/**
 * Route to get profit report (ADMIN only)
 */
router.get('/profit', protect, authorize(UserRole.ADMIN), reportsController.getProfitReport);

/**
 * Route to get top products (ADMIN only)
 */
router.get('/top-products', protect, authorize(UserRole.ADMIN), reportsController.getTopProductsReport);

/**
 * Route to get inventory total value (ADMIN only)
 */
router.get('/inventory-value', protect, authorize(UserRole.ADMIN), reportsController.getInventoryValueReport);

export default router;
