import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.middleware.js';
import ensureActive from '../middleware/ensure-active.middleware.js';
import { loginRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post( '/register', authController.register );
router.post( '/login', loginRateLimiter, authController.login );
router.post( '/verify-login-otp', loginRateLimiter, authController.verifyLoginOtp );
router.post( '/resend-login-otp', loginRateLimiter, authController.resendLoginOtp );
router.post( '/forgot-password', authController.forgotPassword );
router.post( '/reset-password',  authController.resetPassword);
router.post( '/change-password', authenticate, ensureActive, authController.changePassword );
router.post( '/refresh', authController.refresh );
router.post( '/logout', authenticate, authController.logout );    
router.post( '/logout-all', authenticate, authController.logoutAll);
router.get( '/verify-email', authController.verifyEmail );
router.post( '/resend-verification', authController.resendVerification );
router.get( '/view', authenticate, ensureActive, authController.view );

export default router;