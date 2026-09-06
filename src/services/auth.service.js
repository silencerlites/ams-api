// src/services/auth.service.js

import {
  db
} from '../config/firebase.js';

import env from '../config/env.js';

import firebaseAuthService from './firebase-auth.service.js';
import idGeneratorService from './id-generator.service.js';
import accountStatusService from './account-status.service.js';
import loginAttemptService from './login-attempt.service.js';
import loginOtpService from './login-otp.service.js';
import mailService from './mail.service.js';

import adminRepository from '../repositories/admin.repository.js';
import adminProfileRepository from '../repositories/admin-profile.repository.js';
import userHasRoleRepository from '../repositories/user-has-role.repository.js';

import {
  verificationTemplate
} from '../templates/verification.template.js';

import {
  passwordResetTemplate
} from '../templates/password-reset.template.js';

import {
  loginOtpTemplate
} from '../templates/login-otp.template.js';

import AppError from '../errors/app-error.js';

import {
  MODEL_TYPES
} from '../constants/model-types.js';

import {
  AccountStatus,
  AccountStatusName
} from '../enums/account-status.enum.js';

import {
  RoleEnum
} from '../enums/role.enum.js';


class AuthService {

  normalizeEmail(email) {
    return email
      .trim()
      .toLowerCase();
  }


  /*
   * ======================================================
   * FIREBASE OOB HELPERS
   * ======================================================
   */

  extractOobCode(link) {
    try {
      const url =
        new URL(link);

      return url.searchParams
        .get('oobCode');

    } catch {
      return null;
    }
  }


  buildVerificationUrl(
    firebaseLink
  ) {
    const oobCode =
      this.extractOobCode(
        firebaseLink
      );

    if (!oobCode) {
      throw new AppError(
        'Unable to generate verification URL.',
        500,
        'VERIFICATION_URL_GENERATION_FAILED'
      );
    }

    return `${env.clientUrl}/verify-email?oobCode=${encodeURIComponent(
      oobCode
    )}`;
  }


  buildPasswordResetUrl(
    firebaseLink
  ) {
    const oobCode =
      this.extractOobCode(
        firebaseLink
      );

    if (!oobCode) {
      throw new AppError(
        'Unable to generate password reset URL.',
        500,
        'PASSWORD_RESET_URL_GENERATION_FAILED'
      );
    }

    return `${env.clientUrl}/reset-password?oobCode=${encodeURIComponent(
      oobCode
    )}`;
  }

   async exchangeCustomToken(
  customToken
) {
  const result =
    await firebaseAuthService
      .exchangeCustomToken(
        customToken
      );

  return {
    id_token:
      result.idToken,

    refresh_token:
      result.refreshToken,

    expires_in:
      result.expiresIn
  };
}


  /*
   * ======================================================
   * SEND VERIFICATION EMAIL
   * ======================================================
   */

  async sendVerificationEmail({
    email,
    firstName
  }) {
    const firebaseLink =
      await firebaseAuthService
        .generateEmailVerificationLink(
          email
        );

    const verificationUrl =
      this.buildVerificationUrl(
        firebaseLink
      );

    const template =
      verificationTemplate({
        firstName,
        verificationUrl
      });

    await mailService.send({
      to:
        email,

      ...template
    });

    return {
      sent: true
    };
  }


  /*
   * ======================================================
   * SEND PASSWORD RESET EMAIL
   * ======================================================
   */

  async sendPasswordResetEmail({
    email,
    firstName,
    ipAddress = null,
    userAgent = null
  }) {
    const firebaseLink =
      await firebaseAuthService
        .generatePasswordResetLink(
          email
        );

    if (!firebaseLink) {
      return {
        sent: true
      };
    }

    const resetUrl =
      this.buildPasswordResetUrl(
        firebaseLink
      );

    const template =
      passwordResetTemplate({
        firstName,

        resetUrl,

        ipAddress:
          ipAddress ??
          'Unknown',

        device:
          userAgent ??
          'Unknown'
      });

    await mailService.send({
      to:
        email,

      ...template
    });

    return {
      sent: true
    };
  }


  /*
   * ======================================================
   * REGISTER
   * ======================================================
   */

  async register(payload) {
    const email =
      this.normalizeEmail(
        payload.email
      );


    /*
     * Check Firestore.
     */
    const existingAdmin =
      await adminRepository
        .findByEmail(
          email
        );

    if (existingAdmin) {
      throw new AppError(
        'An account with this email already exists.',
        409,
        'EMAIL_ALREADY_EXISTS'
      );
    }


    /*
     * Check Firebase Authentication.
     */
    const existingFirebaseUser =
      await firebaseAuthService
        .getUserByEmail(
          email
        );

    if (existingFirebaseUser) {
      throw new AppError(
        'An account with this email already exists.',
        409,
        'EMAIL_ALREADY_EXISTS'
      );
    }


    /*
     * Password is stored only by
     * Firebase Authentication.
     */
    const firebaseUser =
      await firebaseAuthService
        .createUser({
          email,

          password:
            payload.password,

          displayName:
            `${payload.first_name} ${payload.last_name}`
              .trim()
        });


    let admin;

    try {

      /*
       * Create AMS records atomically.
       */
      await db.runTransaction(
        async transaction => {

          const adminId =
            await idGeneratorService
              .generateAdminId(
                transaction
              );


          admin =
            await adminRepository
              .create(
                {
                  id:
                    adminId,

                  uid:
                    firebaseUser.uid,

                  email,

                  is_active:
                    false,

                  email_verified_at:
                    null,

                  token_version:
                    0,

                  deleted_at:
                    null
                },

                transaction
              );


          await adminProfileRepository
            .create(
              {
                admin_id:
                  adminId,

                first_name:
                  payload.first_name,

                last_name:
                  payload.last_name,

                middle_name:
                  payload.middle_name ??
                  null,

                ext_name:
                  payload.ext_name ??
                  null,

                profile_picture_path:
                  null
              },

              transaction
            );


          await accountStatusService
            .setStatus({
              modelType:
                MODEL_TYPES.ADMIN,

              modelId:
                adminId,

              status:
                AccountStatus.PENDING,

              transaction
            });


          /*
           * Self-registration receives
           * Admin role.
           */
          await userHasRoleRepository
            .create(
              {
                role_id:
                  RoleEnum.ADMIN,

                model_type:
                  MODEL_TYPES.ADMIN,

                model_id:
                  adminId
              },

              transaction
            );
        }
      );

    } catch (error) {

      /*
       * Remove Firebase account when
       * Firestore creation fails.
       */
      try {
        await firebaseAuthService
          .deleteUser(
            firebaseUser.uid
          );

      } catch (rollbackError) {
        console.error(
          'Firebase user rollback failed:',
          rollbackError
        );
      }

      throw error;
    }


    /*
     * Send custom SRJJ verification email.
     *
     * Email failure must not rollback
     * successfully created account.
     */
    try {
      await this
        .sendVerificationEmail({
          email,

          firstName:
            payload.first_name
        });

    } catch (error) {
      console.error(
        'Verification email failed:',
        error
      );
    }


    return {
      id:
        admin.id,

      uid:
        firebaseUser.uid,

      email,

      status:
        AccountStatusName[
          AccountStatus.PENDING
        ]
    };
  }


  /*
   * ======================================================
   * LOGIN
   * ======================================================
   */

async login({
  email,
  password,
  ipAddress,
  userAgent
}) {
  const normalizedEmail =
    this.normalizeEmail(
      email
    );


  const admin =
    await adminRepository
      .findByEmail(
        normalizedEmail
      );


  if (
    !admin ||
    admin.deleted_at
  ) {
    throw new AppError(
      'Invalid email or password.',
      401,
      'INVALID_CREDENTIALS'
    );
  }


  /*
   * Check temporary account lock.
   */
  const lock =
    await loginAttemptService
      .isCurrentlyLocked(
        MODEL_TYPES.ADMIN,
        admin.id
      );


  if (lock.locked) {
    throw new AppError(
      'Account temporarily locked due to too many failed login attempts.',
      423,
      'ACCOUNT_LOCKED',
      {
        unlock_at:
          lock.unlockAt
      }
    );
  }


  /*
   * Validate password through
   * Firebase Authentication.
   */
  try {
    await firebaseAuthService
      .signInWithPassword({
        email:
          normalizedEmail,

        password
      });

  } catch {

    const failure =
      await loginAttemptService
        .registerFailure(
          MODEL_TYPES.ADMIN,
          admin.id
        );


    if (failure.locked) {
      throw new AppError(
        'Too many unsuccessful login attempts. Account temporarily locked.',
        423,
        'ACCOUNT_LOCKED',
        {
          unlock_at:
            failure.unlockAt
        }
      );
    }


    throw new AppError(
      'Invalid email or password.',
      401,
      'INVALID_CREDENTIALS',
      {
        remaining_attempts:
          failure.remaining
      }
    );
  }


  /*
   * Password is valid.
   */
  await loginAttemptService
    .reset(
      MODEL_TYPES.ADMIN,
      admin.id
    );


  /*
   * Check Firebase email verification.
   */
  const firebaseUser =
    await firebaseAuthService
      .getUser(
        admin.uid
      );


  if (!firebaseUser) {
    throw new AppError(
      'Account not found.',
      401,
      'ACCOUNT_NOT_FOUND'
    );
  }


  if (!firebaseUser.emailVerified) {
    throw new AppError(
      'Please verify your email address before signing in.',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }


  /*
   * Synchronize Firebase verification
   * with AMS audit data.
   */
  if (!admin.email_verified_at) {
    await adminRepository
      .update(
        admin.id,
        {
          email_verified_at:
            new Date()
        }
      );
  }


  /*
   * Check AMS account status.
   */
  const statusRecord =
    await accountStatusService
      .getStatus(
        MODEL_TYPES.ADMIN,
        admin.id
      );


  if (!statusRecord) {
    throw new AppError(
      'Account status is unavailable.',
      403,
      'ACCOUNT_STATUS_MISSING'
    );
  }


  switch (
    statusRecord.status
  ) {

    case AccountStatus.PENDING:
      throw new AppError(
        'Your account is awaiting administrator approval.',
        403,
        'ACCOUNT_PENDING'
      );


    case AccountStatus.DEACTIVATED:
      throw new AppError(
        'This account has been deactivated.',
        403,
        'ACCOUNT_DEACTIVATED'
      );


    case AccountStatus.LOCKED:
      throw new AppError(
        'This account is currently locked.',
        423,
        'ACCOUNT_LOCKED'
      );


    case AccountStatus.DELETED:
      throw new AppError(
        'Invalid email or password.',
        401,
        'INVALID_CREDENTIALS'
      );
  }


  if (
    admin.is_active !==
    true
  ) {
    throw new AppError(
      'This account is currently inactive.',
      403,
      'ACCOUNT_INACTIVE'
    );
  }


  /*
   * Get profile for email template.
   */
  const profile =
    await adminProfileRepository
      .findByAdminId(
        admin.id
      );


  /*
   * Create OTP challenge.
   *
   * Only the OTP hash should be
   * stored in Firestore.
   */
  const challenge =
    await loginOtpService
      .create({
        modelType:
          MODEL_TYPES.ADMIN,

        modelId:
          admin.id,

        ipAddress,

        userAgent
      });


  /*
   * Build custom OTP email.
   */
  const template =
    loginOtpTemplate({
      firstName:
        profile?.first_name ??
        'User',

      otp:
        challenge.otp,

      expiresMinutes:
        env.loginOtp.expiresMinutes
    });


  /*
   * Deliver OTP through Resend.
   *
   * Do not return OTP-required
   * success if delivery fails.
   */
  try {
    await mailService
      .send({
        to:
          admin.email,

        ...template
      });

  } catch (error) {
    console.error(
      'Login OTP email failed:',
      error
    );


    /*
     * Invalidate the challenge
     * because the user never
     * received the OTP.
     */
    try {
      await loginOtpService
        .invalidate(
          challenge.challengeId
        );

    } catch (
      invalidateError
    ) {
      console.error(
        'OTP challenge invalidation failed:',
        invalidateError
      );
    }


    throw new AppError(
      'Unable to send login OTP. Please try again.',
      503,
      'LOGIN_OTP_DELIVERY_FAILED'
    );
  }


  return {
    otp_required:
      true,

    challenge_id:
      challenge.challengeId,

    expires_at:
      challenge.expiresAt
  };
}


  /*
   * ======================================================
   * VERIFY LOGIN OTP
   * ======================================================
   */

async verifyLoginOtp({
  challengeId,
  otp
}) {
  const challenge =
    await loginOtpService
      .verify({
        challengeId,
        otp
      });


  if (
    challenge.modelType !==
    MODEL_TYPES.ADMIN
  ) {
    throw new AppError(
      'Unsupported account type.',
      403,
      'ACCOUNT_TYPE_NOT_SUPPORTED'
    );
  }


  const admin =
    await adminRepository
      .findById(
        challenge.modelId
      );


  if (
    !admin ||
    admin.deleted_at
  ) {
    throw new AppError(
      'Account not found.',
      401,
      'ACCOUNT_NOT_FOUND'
    );
  }


  /*
   * Re-check status after OTP.
   */
  const statusRecord =
    await accountStatusService
      .getStatus(
        MODEL_TYPES.ADMIN,
        admin.id
      );


  if (
    !statusRecord ||
    statusRecord.status !==
      AccountStatus.ACTIVE ||
    admin.is_active !== true
  ) {
    throw new AppError(
      'Account is not active.',
      403,
      'ACCOUNT_INACTIVE'
    );
  }


  const roles =
    await userHasRoleRepository
      .findByModel(
        MODEL_TYPES.ADMIN,
        admin.id
      );


  const roleIds =
    roles.map(
      role =>
        role.role_id
    );


  /*
   * Firebase custom token is issued
   * only after AMS OTP verification.
   */
  const customToken =
    await firebaseAuthService
      .createCustomToken(
        admin.uid,
        {
          ams_mfa_verified:
            true,

          model_type:
            MODEL_TYPES.ADMIN,

          admin_id:
            admin.id,

          roles:
            roleIds
        }
      );


  return {
    token_type:
      'Firebase',

    custom_token:
      customToken,

    account: {
      id:
        admin.id,

      uid:
        admin.uid,

      email:
        admin.email,

      is_active:
        admin.is_active,

      roles:
        roleIds
    }
  };
}


  /*
   * ======================================================
   * FORGOT PASSWORD
   * ======================================================
   */

  async sendPasswordReset({
    email,
    ipAddress = null,
    userAgent = null
  }) {
    const normalizedEmail =
      this.normalizeEmail(
        email
      );


    /*
     * Generic behavior prevents
     * account enumeration.
     */
    const admin =
      await adminRepository
        .findByEmail(
          normalizedEmail
        );


    if (
      !admin ||
      admin.deleted_at
    ) {
      return {
        sent: true
      };
    }


    const profile =
      await adminProfileRepository
        .findByAdminId(
          admin.id
        );


    try {
      await this
        .sendPasswordResetEmail({
          email:
            normalizedEmail,

          firstName:
            profile?.first_name ??
            'User',

          ipAddress,

          userAgent
        });

    } catch (error) {
      /*
       * Do not reveal whether
       * the account exists.
       */
      console.error(
        'Password reset email failed:',
        error
      );
    }


    return {
      sent: true
    };
  }


  /*
   * ======================================================
   * RESET PASSWORD
   * ======================================================
   */

async resetPassword({
  oobCode,
  newPassword
}) {
  const result =
    await firebaseAuthService
      .resetPassword({
        oobCode,
        newPassword
      });

  if (result?.email) {
    const firebaseUser =
      await firebaseAuthService
        .getUserByEmail(
          result.email
        );

    if (firebaseUser) {
      await firebaseAuthService
        .revokeSessions(
          firebaseUser.uid
        );
    }
  }

  return {
    reset: true
  };
}

  /*
   * ======================================================
   * CHANGE PASSWORD
   * ======================================================
   */

  async changePassword({
    uid,
    currentPassword,
    newPassword
  }) {
    const firebaseUser =
      await firebaseAuthService
        .getUser(
          uid
        );


    if (
      !firebaseUser ||
      !firebaseUser.email
    ) {
      throw new AppError(
        'Account not found.',
        404,
        'ACCOUNT_NOT_FOUND'
      );
    }


    if (
      currentPassword ===
      newPassword
    ) {
      throw new AppError(
        'New password must be different from your current password.',
        422,
        'PASSWORD_REUSE_NOT_ALLOWED'
      );
    }


    await firebaseAuthService
      .changePassword({
        uid,

        email:
          firebaseUser.email,

        currentPassword,

        newPassword
      });


    return {
      changed: true
    };
  }


  /*
   * ======================================================
   * VERIFY EMAIL
   * ======================================================
   */

  async verifyEmail(
    oobCode
  ) {
    const result =
      await firebaseAuthService
        .verifyEmail(
          oobCode
        );


    /*
     * Update AMS audit timestamp.
     */
    if (result?.localId) {
      const admin =
        await adminRepository
          .findByUid(
            result.localId
          );


      if (
        admin &&
        !admin.email_verified_at
      ) {
        await adminRepository
          .update(
            admin.id,
            {
              email_verified_at:
                new Date()
            }
          );
      }
    }


    return {
      verified: true
    };
  }


  /*
   * ======================================================
   * RESEND EMAIL VERIFICATION
   * ======================================================
   */

async resendVerification({
  email,
  password
}) {
  const normalizedEmail =
    this.normalizeEmail(
      email
    );


  /*
   * Find AMS account.
   */
  const admin =
    await adminRepository
      .findByEmail(
        normalizedEmail
      );


  if (
    !admin ||
    admin.deleted_at
  ) {
    throw new AppError(
      'Account not found.',
      404,
      'ACCOUNT_NOT_FOUND'
    );
  }


  /*
   * Check Firebase account.
   */
  const firebaseUser =
    await firebaseAuthService
      .getUser(
        admin.uid
      );


  if (!firebaseUser) {
    throw new AppError(
      'Firebase account not found.',
      404,
      'FIREBASE_ACCOUNT_NOT_FOUND'
    );
  }


  /*
   * Do not resend if already verified.
   */
  if (
    firebaseUser.emailVerified ===
    true
  ) {
    throw new AppError(
      'Email address is already verified.',
      409,
      'EMAIL_ALREADY_VERIFIED'
    );
  }


  /*
   * Verify password.
   */
  try {
    await firebaseAuthService
      .signInWithPassword({
        email:
          normalizedEmail,

        password
      });

  } catch (error) {
    console.error(
      'Verification resend password validation failed:',
      error
    );

    throw new AppError(
      'Invalid email or password.',
      401,
      'INVALID_CREDENTIALS'
    );
  }


  /*
   * Get profile for email template.
   */
  const profile =
    await adminProfileRepository
      .findByAdminId(
        admin.id
      );


  /*
   * Send verification email.
   */
  try {
    const result =
      await this
        .sendVerificationEmail({
          email:
            normalizedEmail,

          firstName:
            profile?.first_name ??
            'User'
        });


    console.log(
      'Verification email resend successful:',
      {
        email:
          normalizedEmail,

        sent:
          result.sent
      }
    );

  } catch (error) {
    console.error(
      'Verification email resend failed:',
      error
    );


    throw new AppError(
      'Unable to send verification email. Please try again.',
      503,
      'VERIFICATION_EMAIL_DELIVERY_FAILED'
    );
  }


  return {
    sent: true
  };
}


  /*
   * ======================================================
   * LOGOUT ALL
   * ======================================================
   */

  async logoutAll(uid) {
    return firebaseAuthService
      .revokeSessions(
        uid
      );
  }

  async resendLoginOtp({
  challengeId,
  ipAddress,
  userAgent
}) {
  /*
   * Generate a new OTP challenge.
   */
  const challenge =
    await loginOtpService
      .resend({
        challengeId,
        ipAddress,
        userAgent
      });


  /*
   * Find the account related to
   * the OTP challenge.
   */
  if (
    challenge.modelType !==
    MODEL_TYPES.ADMIN
  ) {
    throw new AppError(
      'Unsupported account type.',
      403,
      'ACCOUNT_TYPE_NOT_SUPPORTED'
    );
  }


  const admin =
    await adminRepository
      .findById(
        challenge.modelId
      );


  if (
    !admin ||
    admin.deleted_at
  ) {
    throw new AppError(
      'Account not found.',
      404,
      'ACCOUNT_NOT_FOUND'
    );
  }


  const profile =
    await adminProfileRepository
      .findByAdminId(
        admin.id
      );


  /*
   * Build the new OTP email.
   */
  const template =
    loginOtpTemplate({
      firstName:
        profile?.first_name ??
        'User',

      otp:
        challenge.otp,

      expiresMinutes:
        env.loginOtp.expiresMinutes
    });


  /*
   * Send through Resend.
   */
  try {
    await mailService.send({
      to:
        admin.email,

      ...template
    });

  } catch (error) {
    console.error(
      'Resend login OTP email failed:',
      error
    );


    /*
     * Do not keep an OTP that
     * the user never received.
     */
    try {
      await loginOtpService
        .invalidate(
          challenge.challengeId
        );

    } catch (invalidateError) {
      console.error(
        'OTP invalidation failed:',
        invalidateError
      );
    }


    throw new AppError(
      'Unable to resend login OTP. Please try again.',
      503,
      'LOGIN_OTP_DELIVERY_FAILED'
    );
  }


  return {
    otp_required:
      true,

    challenge_id:
      challenge.challengeId,

    expires_at:
      challenge.expiresAt,

    resend_count:
      challenge.resendCount
  };
}



/*
   * ======================================================
   * VIEW ACCOUNT
   * ======================================================
   */
  async view({
  uid
}) {
  const admin =
    await adminRepository
      .findByUid(
        uid
      );


  if (
    !admin ||
    admin.deleted_at
  ) {
    throw new AppError(
      'Account not found.',
      404,
      'ACCOUNT_NOT_FOUND'
    );
  }


  const profile =
    await adminProfileRepository
      .findByAdminId(
        admin.id
      );


  const status =
    await accountStatusService
      .getStatus(
        MODEL_TYPES.ADMIN,
        admin.id
      );


  const roles =
    await userHasRoleRepository
      .findByModel(
        MODEL_TYPES.ADMIN,
        admin.id
      );


  return {
    account: {
      id:
        admin.id,

      uid:
        admin.uid,

      email:
        admin.email,

      is_active:
        admin.is_active,

      email_verified_at:
        admin.email_verified_at,

      status:
        status?.status ??
        null,

      status_name:
        status
          ? AccountStatusName[
              status.status
            ]
          : null,

      roles:
        roles.map(
          role =>
            role.role_id
        ),

      created_at:
        admin.created_at,

      updated_at:
        admin.updated_at
    },

    profile: {
      first_name:
        profile?.first_name ??
        null,

      middle_name:
        profile?.middle_name ??
        null,

      last_name:
        profile?.last_name ??
        null,

      ext_name:
        profile?.ext_name ??
        null,

      profile_picture_path:
        profile?.profile_picture_path ??
        null
    }
  };
}
}


export default new AuthService();