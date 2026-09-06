import crypto from 'crypto';

import loginOtpRepository from '../repositories/login-otp.repository.js';
import accountStatusService from './account-status.service.js';

import AppError from '../errors/app-error.js';

import {
  ACCOUNT_STATUS
} from '../constants/account-status.js';

import env from '../config/env.js';


class LoginOtpService {

  generateOtp() {
    return crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();
  }


  hashOtp(otp) {
    return crypto
      .createHash('sha256')
      .update(String(otp))
      .digest('hex');
  }


  generateChallengeId() {
    return crypto.randomUUID();
  }


  async create({
    modelType,
    modelId,
    ipAddress = null,
    userAgent = null,
    resendCount = 0
  }) {
    await loginOtpRepository
      .invalidateUnused(
        modelType,
        modelId
      );

    const otp =
      this.generateOtp();

    const challengeId =
      this.generateChallengeId();

    const expiresAt =
      new Date(
        Date.now() +
        env.loginOtp.expiresMinutes *
        60 *
        1000
      );

    await loginOtpRepository.create({
      model_type:
        modelType,

      model_id:
        modelId,

      challenge_id:
        challengeId,

      otp_hash:
        this.hashOtp(otp),

      attempts:
        0,

      resend_count:
        resendCount,

      last_resent_at:
        null,

      expires_at:
        expiresAt,

      verified_at:
        null,

      used_at:
        null,

      ip_address:
        ipAddress,

      user_agent:
        userAgent
    });

    return {
      challengeId,
      otp,
      expiresAt
    };
  }


  async verify({
    challengeId,
    otp
  }) {
    const challenge =
      await loginOtpRepository
        .findByChallengeId(
          challengeId
        );

    if (!challenge) {
      throw new AppError(
        'Invalid login challenge.',
        400,
        'INVALID_LOGIN_CHALLENGE'
      );
    }


    if (challenge.used_at) {
      throw new AppError(
        'Login challenge has already been used.',
        400,
        'LOGIN_CHALLENGE_USED'
      );
    }


    if (
      challenge.expires_at <
      new Date()
    ) {
      await loginOtpRepository
        .markUsed(
          challengeId
        );

      throw new AppError(
        'Login OTP has expired.',
        400,
        'LOGIN_OTP_EXPIRED'
      );
    }


    if (
      challenge.attempts >=
      env.loginOtp.maxAttempts
    ) {
      await loginOtpRepository
        .markUsed(
          challengeId
        );

      throw new AppError(
        'Maximum OTP attempts reached.',
        429,
        'LOGIN_OTP_MAX_ATTEMPTS'
      );
    }


    const otpHash =
      this.hashOtp(otp);

    const valid =
      crypto.timingSafeEqual(
        Buffer.from(
          otpHash,
          'hex'
        ),
        Buffer.from(
          challenge.otp_hash,
          'hex'
        )
      );


    if (!valid) {
      const updated =
        await loginOtpRepository
          .incrementAttempts(
            challengeId
          );

      if (
        updated &&
        updated.attempts >=
        env.loginOtp.maxAttempts
      ) {
        await loginOtpRepository
          .markUsed(
            challengeId
          );

        throw new AppError(
          'Maximum OTP attempts reached.',
          429,
          'LOGIN_OTP_MAX_ATTEMPTS'
        );
      }

      throw new AppError(
        'Invalid login OTP.',
        400,
        'INVALID_LOGIN_OTP'
      );
    }


    await loginOtpRepository
      .markVerified(
        challengeId
      );

    return {
      modelType:
        challenge.model_type,

      modelId:
        challenge.model_id
    };
  }


async resend({
  challengeId,
  ipAddress = null,
  userAgent = null
}) {
  const challenge =
    await loginOtpRepository
      .findByChallengeId(
        challengeId
      );


  if (!challenge) {
    throw new AppError(
      'Invalid login challenge.',
      400,
      'INVALID_LOGIN_CHALLENGE'
    );
  }


  const now =
    new Date();


  const cooldownMs =
    env.loginOtp
      .resendCooldownSeconds *
    1000;


  if (
    challenge.last_resent_at &&
    now.getTime() -
      challenge.last_resent_at.getTime() <
      cooldownMs
  ) {
    throw new AppError(
      'Please wait before requesting another OTP.',
      429,
      'LOGIN_OTP_RESEND_COOLDOWN'
    );
  }


  const resendCount =
    Number(
      challenge.resend_count ?? 0
    ) + 1;


  if (
    resendCount >=
    env.loginOtp.maxResends
  ) {
    await loginOtpRepository
      .markUsed(
        challengeId
      );


    await accountStatusService
      .setStatus({
        modelType:
          challenge.model_type,

        modelId:
          challenge.model_id,

        status:
          AccountStatus.LOCKED
      });


    throw new AppError(
      'Maximum OTP resend attempts reached. Account temporarily locked.',
      423,
      'LOGIN_OTP_MAX_RESENDS'
    );
  }


  /*
   * Mark old challenge used.
   */
  await loginOtpRepository
    .markUsed(
      challengeId,
      {
        resend_count:
          resendCount,

        last_resent_at:
          now
      }
    );


  /*
   * Create new challenge.
   */
  const result =
    await this.create({
      modelType:
        challenge.model_type,

      modelId:
        challenge.model_id,

      ipAddress,

      userAgent,

      resendCount
    });


  return {
    challengeId:
      result.challengeId,

    otp:
      result.otp,

    expiresAt:
      result.expiresAt,

    resendCount,

    modelType:
      challenge.model_type,

    modelId:
      challenge.model_id
  };
}


  async invalidate(
    challengeId
  ) {
    const challenge =
      await loginOtpRepository
        .findByChallengeId(
          challengeId
        );

    if (!challenge) {
      return false;
    }


    if (!challenge.used_at) {
      await loginOtpRepository
        .markUsed(
          challengeId
        );
    }

    return true;
  }
}


export default new LoginOtpService();