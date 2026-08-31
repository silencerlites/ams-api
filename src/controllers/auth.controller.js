import AdminModel from '../models/admin.model.js';
import AdminProfile from '../models/admin-profile.model.js';
import authService from '../services/auth.service.js';
import emailVerificationService from '../services/email-verification.service.js';
import accessTokenService from '../services/access-token.service.js';
import refreshTokenService from '../services/refresh-token.service.js';
import loginOtpService from '../services/login-otp.service.js';
import passwordResetService from '../services/password-reset.service.js';

import {
  registerSchema,
  loginSchema,
  logoutSchema,
  verifyEmailSchema,
  verifyLoginOtpSchema,
  resendLoginOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validators/auth.validator.js';

import asyncHandler from '../utils/async-handler.js';
import { success } from '../utils/response.js';
import AppError from '../errors/app-error.js';
import env from '../config/env.js';

const register = asyncHandler(
  async (req, res) => {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR', validation.error.flatten());
    }

    const result = await authService.register(validation.data);
    return success(res, {
      status: 201,
      message: 'Registration successful. Verify your email and wait for administrator approval.',
      data: result
    });
  }
);

const login = asyncHandler(
  async (req, res) => {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR', validation.error.flatten());
    }

    const result = await authService.login({
      ...validation.data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    return success(res, { message: 'Login successful.', data: result });
  }
);

const verifyLoginOtp = asyncHandler(
  async (req, res) => {
    const validation = verifyLoginOtpSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR', validation.error.flatten());
    }

    const result = await authService.verifyLoginOtp({
      challengeId: validation.data.challenge_id,
      otp: validation.data.otp,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    return success(res, { message: 'Login successful.', data: result });
  }
);

const resendLoginOtp = asyncHandler(
  async (req, res) => {
    const validation = resendLoginOtpSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR', validation.error.flatten());
    }

    const result = await loginOtpService.resend({
      challengeId: validation.data.challenge_id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    return success(res, {
      message: 'A new OTP has been sent to your registered email address.',
      data: {
        challenge_id: result.challengeId,
        expires_at: result.expiresAt,
        resend_count: result.resendCount,
        remaining_resends: Math.max(env.loginOtp.maxResends - result.resendCount, 0),
        resend_available_after_seconds: env.loginOtp.resendCooldownSeconds
      }
    });
  }
);

const refresh = asyncHandler(
  async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError('Refresh token is required.', 422, 'REFRESH_TOKEN_REQUIRED');
    }

    const result = await authService.refresh({
      refreshToken: refresh_token,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    return success(res, {
      message: 'Token refreshed successfully.',
      data: result
    });
  }
);

const logout = asyncHandler(
  async (req, res) => {
    if (!req.auth) {
      throw new AppError('Authentication required.', 401, 'AUTHENTICATION_REQUIRED');
    }
    const validation = logoutSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Refresh token is required.', 422, 'VALIDATION_ERROR', validation.error.flatten());
    }
    const { refresh_token } = validation.data;

    /**
     * Revoke only the CURRENT access token.
     *
     * This prevents this device/session
     * from using /view immediately.
     */
    await accessTokenService.revoke(req.auth);

    /**
     * Revoke only the supplied CURRENT
     * refresh token.
     *
     * Other devices remain logged in.
     */
    await refreshTokenService.revoke(refresh_token);

    return success(res, { message: 'Logout successful.' });
  }
);

const logoutAll = asyncHandler(
  async (req, res) => {
    if (!req.auth) {
      throw new AppError('Authentication required.', 401, 'AUTHENTICATION_REQUIRED');
    }

    const { sub: modelId, model_type: modelType } = req.auth;

    /**
     * Revoke the CURRENT access token.
     */
    await accessTokenService.revoke(req.auth);

    /**
     * Revoke ALL refresh tokens
     * for ALL devices/sessions.
     */
    await refreshTokenService.revokeAll({ modelType, modelId });

    return success(res, { message: 'Logged out from all sessions.' });
  }
);

const verifyEmail = asyncHandler(
  async (req, res) => {
    const validation = verifyEmailSchema.safeParse(req.query);

    if (!validation.success) {
      throw new AppError('Verification token is required.', 422, 'VALIDATION_ERROR');
    }

    await emailVerificationService.verify(validation.data.token);
    return success(res, { message: 'Email successfully verified. Your account is awaiting administrator approval.' });
  }
);

const resendVerification = asyncHandler(
  async (req, res) => {
    const { email } = loginSchema.pick({ email: true }).parse(req.body);

    /*
     * Implementation deliberately returns
     * a generic result regardless of whether
     * the account exists.
     */
    const Admin = AdminModel.default;
    const admin = await Admin.findOne({ email, deleted_at: null });

    if (admin && !admin.email_verified_at) await emailVerificationService.sendAdminVerification(admin);

    return success(res, { message: 'If the account exists and requires verification, a verification email has been sent.' });
  }
);

const forgotPassword = asyncHandler(
  async (req, res) => {
    const validation = forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR', validation.error.flatten())
    }

    await passwordResetService.request({ email: validation.data.email });

    /**
     * Always return the same result
     * even if account doesn't exist.
     */
    return success(res, { message: 'If the account exists, password reset instructions have been sent to the registered email address.' });
  }
);

const resetPassword = asyncHandler(
  async (req, res) => {
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR', validation.error.flatten());
    }

    await passwordResetService.reset({
      token: validation.data.token,
      password: validation.data.password
    });

    return success(res, { message: 'Password reset successfully. Please login again using your new password.' });
  }
);

const changePassword = asyncHandler(
    async (req, res) => {

      const validation = changePasswordSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError('Validation failed.', 422, 'VALIDATION_ERROR',validation.error.flatten());
      }

      const adminId = req.auth.sub;
      await authService.changePassword({ adminId, currentPassword:validation.data.current_password, newPassword:validation.data.password});
      return success(res, { message: 'Password changed successfully. Please login again.' });
    }
  );

const view = asyncHandler(
  async (req, res) => {
    const profile = await AdminProfile.findOne({ admin_id: req.account.id }).lean();
    return success(res, { data: { account:req.account, profile } });
  }
);

export default {
  register,
  login,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  refresh,
  logout,
  logoutAll,
  verifyEmail,
  resendVerification,
  view
};