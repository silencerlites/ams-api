import { Router } from 'express';

import authController from '../controllers/auth.controller.js';

import authenticate from '../middleware/authenticate.middleware.js';
import ensureActive from '../middleware/ensure-active.middleware.js';

import {
  authRateLimiter,
  loginRateLimiter
} from '../middleware/rate-limit.middleware.js';


const router = Router();


/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account registered successfully.
 *       409:
 *         description: Email already exists.
 *       422:
 *         description: Validation failed.
 */
router.post(
  '/register',
  authRateLimiter,
  authController.register
);


/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       401:
 *         description: Invalid credentials.
 *       403:
 *         description: Account unavailable.
 *       423:
 *         description: Account temporarily locked.
 */
router.post(
  '/login',
  loginRateLimiter,
  authController.login
);


/**
 * @swagger
 * /api/v1/auth/verify-login-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify login OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 *       401:
 *         description: Invalid OTP.
 *       429:
 *         description: Maximum OTP attempts exceeded.
 */
router.post(
  '/verify-login-otp',
  loginRateLimiter,
  authController.verifyLoginOtp
);

/**
 * @swagger
 * /api/v1/auth/exchange-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Exchange Firebase custom token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - custom_token
 *             properties:
 *               custom_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Firebase ID token generated successfully.
 *       401:
 *         description: Invalid custom token.
 */
router.post(
  '/exchange-token',
  authRateLimiter,
  authController.exchangeToken
);


/**
 * @swagger
 * /api/v1/auth/resend-login-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Resend login OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpChallengeRequest'
 *     responses:
 *       200:
 *         description: OTP resent successfully.
 *       423:
 *         description: Account locked or resend limit reached.
 *       429:
 *         description: Resend cooldown active.
 */
router.post(
  '/resend-login-otp',
  loginRateLimiter,
  authController.resendLoginOtp
);


/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Password]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset request accepted.
 *       422:
 *         description: Validation failed.
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  authController.forgotPassword
);


/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Password]
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid or expired reset code.
 *       422:
 *         description: Validation failed.
 */
router.post(
  '/reset-password',
  authRateLimiter,
  authController.resetPassword
);


/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Password]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Account inactive.
 *       422:
 *         description: Invalid current password.
 */
router.post(
  '/change-password',
  authenticate,
  ensureActive,
  authController.changePassword
);


/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout current session
 *     description: Client should also call Firebase signOut().
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout acknowledged successfully.
 *       401:
 *         description: Authentication required.
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);


/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout all sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All Firebase sessions revoked successfully.
 *       401:
 *         description: Authentication required.
 */
router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll
);


/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oob_code
 *             properties:
 *               oob_code:
 *                 type: string
 *                 example: FirebaseOobCode
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid or expired verification code.
 *       422:
 *         description: Validation failed.
 */
router.post(
  '/verify-email',
  authRateLimiter,
  authController.verifyEmail
);


/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     tags: [Authentication]
 *     summary: Resend verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Verification request accepted.
 *       422:
 *         description: Validation failed.
 */
router.post(
  '/resend-verification',
  authRateLimiter,
  authController.resendVerification
);


/**
 * @swagger
 * /api/v1/auth/view:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current account returned successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Account inactive.
 *       404:
 *         description: Account not found.
 */
router.get(
  '/view',
  authenticate,
  ensureActive,
  authController.view
);


export default router;