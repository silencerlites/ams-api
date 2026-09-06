// src/services/firebase-auth.service.js

import {
  firebaseAuth
} from '../config/firebase.js';

import env from '../config/env.js';
import AppError from '../errors/app-error.js';


const FIREBASE_AUTH_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts';


const FIREBASE_ERROR_MAP = {
  EMAIL_EXISTS: {
    status: 409,
    code: 'EMAIL_ALREADY_EXISTS',
    message:
      'An account with this email already exists.'
  },

  INVALID_LOGIN_CREDENTIALS: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    message:
      'Invalid email or password.'
  },

  INVALID_PASSWORD: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    message:
      'Invalid email or password.'
  },

  EMAIL_NOT_FOUND: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    message:
      'Invalid email or password.'
  },

  USER_DISABLED: {
    status: 403,
    code: 'ACCOUNT_DISABLED',
    message:
      'This account has been disabled.'
  },

  TOO_MANY_ATTEMPTS_TRY_LATER: {
    status: 429,
    code: 'TOO_MANY_ATTEMPTS',
    message:
      'Too many attempts. Please try again later.'
  },

  EXPIRED_OOB_CODE: {
    status: 400,
    code: 'EXPIRED_ACTION_CODE',
    message:
      'The action link has expired.'
  },

  INVALID_OOB_CODE: {
    status: 400,
    code: 'INVALID_ACTION_CODE',
    message:
      'The action link is invalid.'
  },

  WEAK_PASSWORD: {
    status: 422,
    code: 'WEAK_PASSWORD',
    message:
      'The password does not meet the required security rules.'
  }
};


class FirebaseAuthService {

  normalizeEmail(email) {
    return email
      .trim()
      .toLowerCase();
  }


  handleFirebaseRestError(
    firebaseCode
  ) {
    const normalizedCode =
      String(firebaseCode)
        .split(' : ')[0];

    const mapped =
      FIREBASE_ERROR_MAP[
        normalizedCode
      ];

    if (mapped) {
      throw new AppError(
        mapped.message,
        mapped.status,
        mapped.code
      );
    }

    throw new AppError(
      'Firebase authentication request failed.',
      400,
      normalizedCode ||
        'FIREBASE_AUTH_ERROR'
    );
  }


  async #request(
    action,
    payload
  ) {
    try {
      const response =
        await fetch(
          `${FIREBASE_AUTH_URL}:${action}?key=${env.firebase.webApiKey}`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(
                payload
              )
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        const firebaseCode =
          data?.error?.message ||
          'FIREBASE_AUTH_ERROR';

        this.handleFirebaseRestError(
          firebaseCode
        );
      }

      return data;

    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      console.error(
        'Firebase Auth REST error:',
        error
      );

      throw new AppError(
        'Authentication service is currently unavailable.',
        503,
        'AUTH_SERVICE_UNAVAILABLE'
      );
    }
  }


  async createUser({
    email,
    password,
    displayName = null,
    disabled = false
  }) {
    try {
      return await firebaseAuth
        .createUser({
          email:
            this.normalizeEmail(
              email
            ),

          password,

          emailVerified:
            false,

          disabled,

          ...(displayName
            ? {
                displayName
              }
            : {})
        });

    } catch (error) {
      if (
        error.code ===
        'auth/email-already-exists'
      ) {
        throw new AppError(
          'An account with this email already exists.',
          409,
          'EMAIL_ALREADY_EXISTS'
        );
      }

      if (
        error.code ===
        'auth/invalid-password'
      ) {
        throw new AppError(
          'Invalid password.',
          422,
          'INVALID_PASSWORD'
        );
      }

      console.error(
        'Firebase create user error:',
        error
      );

      throw new AppError(
        'Unable to create authentication account.',
        500,
        'AUTH_ACCOUNT_CREATION_FAILED'
      );
    }
  }


  async updateUser(
    uid,
    payload
  ) {
    try {
      return await firebaseAuth
        .updateUser(
          uid,
          payload
        );

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        throw new AppError(
          'Account not found.',
          404,
          'ACCOUNT_NOT_FOUND'
        );
      }

      console.error(
        'Firebase update user error:',
        error
      );

      throw new AppError(
        'Unable to update authentication account.',
        500,
        'AUTH_ACCOUNT_UPDATE_FAILED'
      );
    }
  }


  async deleteUser(uid) {
    try {
      await firebaseAuth
        .deleteUser(uid);

      return {
        deleted: true
      };

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        return {
          deleted: false
        };
      }

      console.error(
        'Firebase delete user error:',
        error
      );

      throw new AppError(
        'Unable to delete authentication account.',
        500,
        'AUTH_ACCOUNT_DELETE_FAILED'
      );
    }
  }


  async getUser(uid) {
    try {
      return await firebaseAuth
        .getUser(uid);

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        return null;
      }

      console.error(
        'Firebase get user error:',
        error
      );

      throw new AppError(
        'Unable to retrieve authentication account.',
        500,
        'AUTH_ACCOUNT_LOOKUP_FAILED'
      );
    }
  }


  async getUserByEmail(email) {
    try {
      return await firebaseAuth
        .getUserByEmail(
          this.normalizeEmail(
            email
          )
        );

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        return null;
      }

      console.error(
        'Firebase get user by email error:',
        error
      );

      throw new AppError(
        'Unable to retrieve authentication account.',
        500,
        'AUTH_ACCOUNT_LOOKUP_FAILED'
      );
    }
  }


  async setDisabled(
    uid,
    disabled
  ) {
    return this.updateUser(
      uid,
      {
        disabled:
          Boolean(disabled)
      }
    );
  }


  async markEmailVerified(
    uid
  ) {
    return this.updateUser(
      uid,
      {
        emailVerified: true
      }
    );
  }


  async signInWithPassword({
    email,
    password
  }) {
    return this.#request(
      'signInWithPassword',
      {
        email:
          this.normalizeEmail(
            email
          ),

        password,

        returnSecureToken:
          true
      }
    );
  }


  async generateEmailVerificationLink(
    email,
    actionCodeSettings =
      undefined
  ) {
    try {
      return await firebaseAuth
        .generateEmailVerificationLink(
          this.normalizeEmail(
            email
          ),
          actionCodeSettings
        );

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        throw new AppError(
          'Account not found.',
          404,
          'ACCOUNT_NOT_FOUND'
        );
      }

      console.error(
        'Firebase verification link error:',
        error
      );

      throw new AppError(
        'Unable to generate email verification link.',
        500,
        'VERIFICATION_LINK_GENERATION_FAILED'
      );
    }
  }


  async generatePasswordResetLink(
    email,
    actionCodeSettings =
      undefined
  ) {
    try {
      return await firebaseAuth
        .generatePasswordResetLink(
          this.normalizeEmail(
            email
          ),
          actionCodeSettings
        );

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        return null;
      }

      console.error(
        'Firebase password reset link error:',
        error
      );

      throw new AppError(
        'Unable to generate password reset link.',
        500,
        'PASSWORD_RESET_LINK_GENERATION_FAILED'
      );
    }
  }


  async verifyEmail(
  oobCode
) {
  try {
    return await this.#request(
      'update',
      {
        oobCode
      }
    );

  } catch (error) {
    if (
      error.code ===
        'EXPIRED_ACTION_CODE' ||
      error.code ===
        'INVALID_ACTION_CODE'
    ) {
      throw new AppError(
        'Email verification link is invalid or expired.',
        400,
        'INVALID_VERIFICATION_CODE'
      );
    }

    throw error;
  }
}


  async verifyPasswordResetCode(
    oobCode
  ) {
    try {
      return await this.#request(
        'resetPassword',
        {
          oobCode
        }
      );

    } catch (error) {
      if (
        error.code ===
          'EXPIRED_ACTION_CODE' ||
        error.code ===
          'INVALID_ACTION_CODE'
      ) {
        throw new AppError(
          'Password reset link is invalid or expired.',
          400,
          'INVALID_RESET_CODE'
        );
      }

      throw error;
    }
  }


async resetPassword({
  oobCode,
  newPassword
}) {
  return this.#request(
    'resetPassword',
    {
      oobCode,
      newPassword
    }
  );
}

  async changePassword({
    uid,
    email,
    currentPassword,
    newPassword
  }) {
    /*
     * Verify the current password
     * before allowing an Admin SDK
     * password update.
     */
    await this
      .signInWithPassword({
        email,

        password:
          currentPassword
      });


    try {
      await firebaseAuth
        .updateUser(
          uid,
          {
            password:
              newPassword
          }
        );


      /*
       * Force all Firebase sessions
       * to authenticate again.
       */
      await firebaseAuth
        .revokeRefreshTokens(
          uid
        );


      return {
        changed: true
      };

    } catch (error) {
      if (
        error.code ===
        'auth/user-not-found'
      ) {
        throw new AppError(
          'Account not found.',
          404,
          'ACCOUNT_NOT_FOUND'
        );
      }

      if (
        error.code ===
        'auth/invalid-password'
      ) {
        throw new AppError(
          'The new password is invalid.',
          422,
          'INVALID_PASSWORD'
        );
      }

      console.error(
        'Firebase change password error:',
        error
      );

      throw new AppError(
        'Unable to change password.',
        500,
        'PASSWORD_CHANGE_FAILED'
      );
    }
  }


  async createCustomToken(
    uid,
    claims = {}
  ) {
    try {
      return await firebaseAuth
        .createCustomToken(
          uid,
          claims
        );

    } catch (error) {
      console.error(
        'Firebase custom token error:',
        error
      );

      throw new AppError(
        'Unable to create authentication session.',
        500,
        'AUTH_TOKEN_CREATION_FAILED'
      );
    }
  }


  async verifyIdToken(
    token,
    checkRevoked = true
  ) {
    try {
      return await firebaseAuth
        .verifyIdToken(
          token,
          checkRevoked
        );

    } catch (error) {
      if (
        error.code ===
        'auth/id-token-expired'
      ) {
        throw new AppError(
          'Authentication token has expired.',
          401,
          'AUTH_TOKEN_EXPIRED'
        );
      }


      if (
        error.code ===
        'auth/id-token-revoked'
      ) {
        throw new AppError(
          'Your session has ended. Please login again.',
          401,
          'SESSION_REVOKED'
        );
      }


      if (
        error.code ===
        'auth/user-disabled'
      ) {
        throw new AppError(
          'This account has been disabled.',
          403,
          'ACCOUNT_DISABLED'
        );
      }


      throw new AppError(
        'Invalid authentication token.',
        401,
        'INVALID_AUTH_TOKEN'
      );
    }
  }

  async exchangeCustomToken(
  customToken
) {
  return this.#request(
    'signInWithCustomToken',
    {
      token:
        customToken,

      returnSecureToken:
        true
    }
  );
}

  async revokeSessions(
    uid
  ) {
    try {
      await firebaseAuth
        .revokeRefreshTokens(
          uid
        );

      return {
        revoked: true
      };

    } catch (error) {
      console.error(
        'Firebase revoke sessions error:',
        error
      );

      throw new AppError(
        'Unable to revoke sessions.',
        500,
        'SESSION_REVOCATION_FAILED'
      );
    }
  }

  
}


export default new FirebaseAuthService();