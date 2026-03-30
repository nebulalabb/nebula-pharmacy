import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';

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
