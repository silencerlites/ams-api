import env from '../config/env.js';
import AppError from '../errors/app-error.js';

const SITE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

class TurnstileService {
  async verify({
    token,
    ipAddress = null
  }) {
    if (!token) {
      throw new AppError(
        'Security verification is required.',
        422,
        'TURNSTILE_TOKEN_REQUIRED'
      );
    }

    if (!env.turnstile.secretKey) {
      console.error(
        'TURNSTILE_SECRET_KEY is not configured.'
      );

      throw new AppError(
        'Security verification is unavailable.',
        500,
        'TURNSTILE_NOT_CONFIGURED'
      );
    }

    try {
      const payload = {
        secret:
          env.turnstile.secretKey,

        response:
          token
      };

      /*
       * remoteip is optional,
       * but useful when available.
       */
      if (ipAddress) {
        payload.remoteip =
          ipAddress;
      }

      const response =
        await fetch(
          SITE_VERIFY_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(
                payload
              ),

            signal:
              AbortSignal.timeout(
                10000
              )
          }
        );

      if (!response.ok) {
        console.error(
          'Turnstile Siteverify HTTP error:',
          response.status
        );

        throw new AppError(
          'Security verification is temporarily unavailable.',
          503,
          'TURNSTILE_SERVICE_UNAVAILABLE'
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        console.warn(
          'Turnstile verification failed:',
          result['error-codes'] ??
            []
        );

        throw new AppError(
          'Security verification failed. Please try again.',
          403,
          'TURNSTILE_VERIFICATION_FAILED'
        );
      }

      return {
        success: true,

        hostname:
          result.hostname ??
          null,

        challengeTs:
          result.challenge_ts ??
          null
      };

    } catch (error) {
      /*
       * Preserve our own AppError.
       */
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      console.error(
        'Turnstile verification error:',
        error
      );

      /*
       * Fail closed.
       *
       * Do not allow login when
       * Turnstile cannot be verified.
       */
      throw new AppError(
        'Security verification is temporarily unavailable. Please try again.',
        503,
        'TURNSTILE_SERVICE_UNAVAILABLE'
      );
    }
  }
}

export default new TurnstileService();