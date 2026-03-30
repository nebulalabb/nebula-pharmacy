import { Router } from 'express';
import * as productsController from './products.controller';
import { createProductSchema, updateProductSchema, productQuerySchema } from './products.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Route to list all products (Authenticated)
 * Supports search, filter, pagination
 */
router.get('/', protect, validate(productQuerySchema), productsController.getAllProducts);

/**
 * Route to get product by ID (Authenticated)
 */
router.get('/:id', protect, productsController.getProductById);

/**
 * Route to get product by Barcode (Authenticated)
 */
router.get('/barcode/:barcode', protect, productsController.getProductByBarcode);

/**
 * Route to create a new product (ADMIN only)
 */
router.post('/', protect, authorize(UserRole.ADMIN), validate(createProductSchema), productsController.createProduct);

/**
 * Route to update a product (ADMIN only)
 */
router.put('/:id', protect, authorize(UserRole.ADMIN), validate(updateProductSchema), productsController.updateProduct);

/**
 * Route to delete (disable) a product (ADMIN only)
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), productsController.deleteProduct);

export default router;
