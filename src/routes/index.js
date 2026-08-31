import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminAccountRoutes from './admin-account.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admins', adminAccountRoutes);

export default router;