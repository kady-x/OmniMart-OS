import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateSession, requireRole } from '../../core/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Auth Flow: Login and Generate Session
router.post('/login', authController.login.bind(authController));

// Manager Only: Register new staff
router.post('/register', validateSession, requireRole(['manager']), authController.register.bind(authController));

// Manager Only: Get all staff
router.get('/staff', validateSession, requireRole(['manager']), authController.getStaff.bind(authController));

// Manager Only: Toggle user active/inactive
router.patch('/staff/:userId/toggle', validateSession, requireRole(['manager']), authController.toggleUser.bind(authController));

export default router;
