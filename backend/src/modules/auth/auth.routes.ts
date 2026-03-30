import { Router } from 'express';
import * as authController from './auth.controller';
import { loginSchema, changePasswordSchema } from './auth.schema';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

/**
 * Route for user login
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * Route for user profile (protected)
 */
router.get('/me', protect, authController.getMe);

/**
 * Route for user logout (protected)
 */
router.post('/logout', protect, authController.logout);

/**
 * Route for changing user password (protected)
 */
router.put('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

export default router;
