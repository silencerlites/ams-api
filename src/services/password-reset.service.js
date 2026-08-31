import Admin
  from '../models/admin.model.js';

import AdminProfile
  from '../models/admin-profile.model.js';

import tokenService
  from './token.service.js';

import refreshTokenService
  from './refresh-token.service.js';

import mailService
  from './mail.service.js';

import env
  from '../config/env.js';

import AppError
  from '../errors/app-error.js';

import {
  MODEL_TYPES
} from '../constants/model-types.js';

import {
  passwordResetTemplate
} from '../templates/password-reset.template.js';


class PasswordResetService {

  /**
   * Request password reset.
   *
   * Important:
   * Do not reveal whether an email
   * exists in the database.
   */
  async request({
    email
  }) {

    /**
     * Normalize email.
     */
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    /**
     * Find active/non-deleted account.
     */
    const admin =
      await Admin.findOne({
        email:
          normalizedEmail,

        deleted_at:
          null
      });


    /**
     * Do NOT throw ACCOUNT_NOT_FOUND.
     *
     * This protects against
     * account enumeration.
     */
    if (!admin) {
      return {
        sent: true
      };
    }


    /**
     * Get profile information
     * for personalized email.
     */
    const profile =
      await AdminProfile.findOne({
        admin_id:
          admin.id
      })
        .lean();


    /**
     * Generate short-lived
     * password reset JWT.
     *
     * token_version makes this
     * reset token single-use.
     */
    const resetToken =
      tokenService
        .createPasswordResetToken({
          subject:
            admin.id,

          modelType:
            MODEL_TYPES.ADMIN,

          tokenVersion:
            admin.token_version
        });


    /**
     * Frontend password reset URL.
     *
     * Example:
     *
     * http://localhost:3000/reset-password
     * ?token=eyJ...
     */
    const resetUrl =
      `${env.clientUrl}` +
      `/reset-password?token=` +
      encodeURIComponent(
        resetToken
      );


    /**
     * Prepare email.
     */
    const template =
      passwordResetTemplate({
        firstName:
          profile?.first_name ||
          'User',

        resetUrl
      });


    /**
     * Send reset email.
     *
     * We intentionally do not expose
     * email delivery failure to the
     * public API response because it
     * could reveal whether an account
     * exists.
     */
    try {

      await mailService.send({
        to:
          admin.email,

        ...template
      });

    } catch (error) {

      console.error(
        'Password reset email failed:',
        error
      );

    }


    return {
      sent: true
    };
  }


  /**
   * Reset password.
   */
  async reset({
    token,
    password
  }) {

    let payload;


    /**
     * Verify password reset JWT.
     */
    try {

      payload =
        tokenService
          .verifyPasswordResetToken(
            token
          );

    } catch (error) {

      /**
       * Expired token.
       */
      if (
        error.name ===
        'TokenExpiredError'
      ) {

        throw new AppError(
          'Password reset link has expired.',
          400,
          'PASSWORD_RESET_TOKEN_EXPIRED'
        );
      }


      /**
       * Any other JWT problem.
       */
      throw new AppError(
        'Password reset token is invalid.',
        400,
        'INVALID_PASSWORD_RESET_TOKEN'
      );
    }


    /**
     * Make sure this JWT was created
     * specifically for password reset.
     */
    if (
      payload.type !==
      'password_reset'
    ) {

      throw new AppError(
        'Invalid password reset token.',
        400,
        'INVALID_PASSWORD_RESET_TOKEN'
      );
    }


    /**
     * Make sure account type
     * is supported.
     */
    if (
      payload.model_type !==
      MODEL_TYPES.ADMIN
    ) {

      throw new AppError(
        'Unsupported account type.',
        400,
        'ACCOUNT_TYPE_NOT_SUPPORTED'
      );
    }


    /**
     * JWT subject must exist.
     */
    if (!payload.sub) {

      throw new AppError(
        'Invalid password reset token.',
        400,
        'INVALID_PASSWORD_RESET_TOKEN'
      );
    }


    /**
     * Password is normally select:false.
     *
     * We need it here to compare the
     * new password with the old password.
     */
    const admin =
      await Admin.findOne({
        id:
          payload.sub,

        deleted_at:
          null
      })
        .select(
          '+password'
        );


    /**
     * Account no longer exists.
     */
    if (!admin) {

      throw new AppError(
        'Account not found.',
        404,
        'ACCOUNT_NOT_FOUND'
      );
    }


    /**
     * Single-use reset-token protection.
     *
     * Example:
     *
     * Reset JWT:
     * token_version = 0
     *
     * Database:
     * token_version = 0
     *
     * Allowed.
     *
     * After successful reset:
     *
     * Database:
     * token_version = 1
     *
     * Old JWT:
     * token_version = 0
     *
     * 0 !== 1
     *
     * Token can no longer be used.
     */
    if (
      payload.token_version !==
      admin.token_version
    ) {

      throw new AppError(
        'Password reset token has already been used or invalidated.',
        400,
        'PASSWORD_RESET_TOKEN_INVALIDATED'
      );
    }


    /**
     * Prevent user from reusing
     * their current password.
     */
    const samePassword =
      await admin.comparePassword(
        password
      );


    if (samePassword) {

      throw new AppError(
        'New password must be different from your current password.',
        422,
        'PASSWORD_REUSE_NOT_ALLOWED'
      );
    }


    /**
     * Assign new password.
     *
     * Your Admin model's pre-save
     * middleware should automatically
     * hash this value.
     */
    admin.password =
      password;


    /**
     * Increment token_version.
     *
     * This invalidates:
     *
     * 1. Current password reset JWT.
     * 2. Existing access tokens using
     *    the previous token_version.
     */
    admin.token_version += 1;


    /**
     * Save account.
     *
     * Password gets hashed by
     * Admin pre-save middleware.
     */
    await admin.save();


    /**
     * Revoke all refresh tokens
     * for this Admin.
     *
     * Your existing service currently
     * uses:
     *
     * revokeAll(modelType, modelId)
     */
    await refreshTokenService
      .revokeAll(
        MODEL_TYPES.ADMIN,
        admin.id
      );


    return {
      reset: true
    };
  }
}


export default new PasswordResetService();