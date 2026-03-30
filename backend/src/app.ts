import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import categoryRoutes from './modules/categories/category.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import productRoutes from './modules/products/products.routes';
import purchaseRoutes from './modules/purchase/purchase.routes';

dotenv.config();

const app = express();

/**
 * Standard Middleware
 */
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

/**
 * Auth Module
 */
app.use('/api/auth', authRoutes);

/**
 * Users Module
 */
app.use('/api/users', userRoutes);

/**
 * Products, Categories & Suppliers Module
 */
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);

/**
 * Purchase Orders Module
 */
app.use('/api/purchase-orders', purchaseRoutes);

/**
 * Routes Placeholder
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Nebula Pharmacy API',
    status: 'Running',
    version: '1.0.0'
  });
});

/**
 * Health Check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

/**
 * Global Error Handler (Must be last)
 */
app.use(errorHandler);

export default app;
