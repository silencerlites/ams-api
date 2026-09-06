import authService from '../services/auth.service.js';
import loginOtpService from '../services/login-otp.service.js';

import adminRepository from '../repositories/admin.repository.js';
import adminProfileRepository from '../repositories/admin-profile.repository.js';

import {
  registerSchema,
  loginSchema,
  verifyLoginOtpSchema,
  resendLoginOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema
} from '../validators/auth.validator.js';

import asyncHandler from '../utils/async-handler.js';
import { success } from '../utils/response.js';
import AppError from '../errors/app-error.js';
import env from '../config/env.js';


const validate = (schema, payload) => {
  const result =
    schema.safeParse(payload);

  if (!result.success) {
    throw new AppError(
      'Validation failed.',
      422,
      'VALIDATION_ERROR',
      result.error.flatten()
    );
  }

  return result.data;
};


/*
 * ======================================================
 * REGISTER
 * ======================================================
 */

const register = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        registerSchema,
        req.body
      );

    const result =
      await authService.register(
        data
      );

    return success(res, {
      status: 201,

      message:
        'Registration successful. Verify your email and wait for administrator approval.',

      data: result
    });
  }
);


/*
 * ======================================================
 * LOGIN
 * ======================================================
 */

const login = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        loginSchema,
        req.body
      );

    const result =
      await authService.login({
        ...data,

        ipAddress:
          req.ip,

        userAgent:
          req.get('user-agent')
      });

    return success(res, {
      message:
        'Login successful.',

      data:
        result
    });
  }
);


/*
 * ======================================================
 * VERIFY LOGIN OTP
 * ======================================================
 */

const verifyLoginOtp = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        verifyLoginOtpSchema,
        req.body
      );

    const result =
      await authService
        .verifyLoginOtp({
          challengeId:
            data.challenge_id,

          otp:
            data.otp
        });

    return success(res, {
      message:
        'Login successful.',

      data:
        result
    });
  }
);


/*
 * ======================================================
 * RESEND LOGIN OTP
 * ======================================================
 */

const resendLoginOtp =
  asyncHandler(
    async (req, res) => {
      const data =
        validate(
          resendLoginOtpSchema,
          req.body
        );


      const result =
        await authService
          .resendLoginOtp({
            challengeId:
              data.challenge_id,

            ipAddress:
              req.ip,

            userAgent:
              req.get(
                'user-agent'
              )
          });


      return success(res, {
        message:
          'A new OTP has been sent to your email address.',

        data:
          result
      });
    }
  );


/*
 * ======================================================
 * FORGOT PASSWORD
 * ======================================================
 */

const forgotPassword = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        forgotPasswordSchema,
        req.body
      );

    try {
      await authService
        .sendPasswordReset({
          email:
            data.email,

          ipAddress:
            req.ip,

          userAgent:
            req.get(
              'user-agent'
            )
        });

    } catch (error) {
      /*
       * Prevent account enumeration.
       */
      console.error(
        'Password reset request failed:',
        error
      );
    }

    return success(res, {
      message:
        'If the account exists, password reset instructions have been sent to the registered email address.'
    });
  }
);


/*
 * ======================================================
 * RESET PASSWORD
 * ======================================================
 */

const resetPassword = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        resetPasswordSchema,
        req.body
      );

    await authService
      .resetPassword({
        oobCode:
          data.token,

        newPassword:
          data.password
      });

    return success(res, {
      message:
        'Password reset successfully. Please login using your new password.'
    });
  }
);


/*
 * ======================================================
 * CHANGE PASSWORD
 * ======================================================
 */

const changePassword = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        changePasswordSchema,
        req.body
      );

    if (!req.auth?.uid) {
      throw new AppError(
        'Authentication required.',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    await authService
      .changePassword({
        uid:
          req.auth.uid,

        currentPassword:
          data.current_password,

        newPassword:
          data.password
      });

    return success(res, {
      message:
        'Password changed successfully. Please login again.'
    });
  }
);


/*
 * ======================================================
 * VERIFY EMAIL
 * ======================================================
 */

const verifyEmail = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        verifyEmailSchema,
        req.body
      );

    await authService
      .verifyEmail(
        data.oob_code
      );

    return success(res, {
      message:
        'Email verified successfully. Your account is awaiting administrator approval.'
    });
  }
);

/*
 * ======================================================
 * RESEND VERIFICATION
 * ======================================================
 */

const resendVerification = asyncHandler(
  async (req, res) => {
    const data =
      validate(
        loginSchema,
        req.body
      );

    try {
      await authService
        .resendVerification({
          email:
            data.email,

          password:
            data.password
        });
    } catch (error) {
      /*
       * Prevent account enumeration.
       */
      console.error(
        'Verification resend failed:',
        error.code ||
          error.message
      );
    }

    return success(res, {
      message:
        'If the account exists and requires verification, a verification email has been sent.'
    });
  }
);


/*
 * ======================================================
 * LOGOUT
 * ======================================================
 */

const logout = asyncHandler(
  async (req, res) => {
    if (!req.auth?.uid) {
      throw new AppError(
        'Authentication required.',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    /*
     * Normal logout is performed
     * client-side using Firebase signOut().
     */

    return success(res, {
      message:
        'Logout successful.'
    });
  }
);


/*
 * ======================================================
 * LOGOUT ALL
 * ======================================================
 */

const logoutAll = asyncHandler(
  async (req, res) => {
    if (!req.auth?.uid) {
      throw new AppError(
        'Authentication required.',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    await authService
      .logoutAll(
        req.auth.uid
      );

    return success(res, {
      message:
        'Logged out from all sessions.'
    });
  }
);


/*
 * ======================================================
 * VIEW ACCOUNT
 * ======================================================
 */

const view = asyncHandler(
  async (req, res) => {
    const result =
      await authService.view({
        uid:
          req.auth.uid
      });

    return success(res, {
      message:
        'Account retrieved successfully.',

      data:
        result
    });
  }
);

const exchangeToken =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        custom_token
      } =
        req.body;


      if (!custom_token) {
        throw new AppError(
          'Custom token is required.',
          422,
          'VALIDATION_ERROR'
        );
      }


      const result =
        await authService
          .exchangeCustomToken(
            custom_token
          );


      return success(
        res,
        {
          message:
            'Firebase token exchanged successfully.',

          data:
            result
        }
      );
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
  verifyEmail,
  resendVerification,
  logout,
  logoutAll,
  exchangeToken,
  view
};