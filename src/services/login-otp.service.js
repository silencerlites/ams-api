import env from '../config/env.js';
import LoginOtp from '../models/login-otp.model.js';
import AdminProfile from '../models/admin-profile.model.js';
import mailService from './mail.service.js';
import AppError from '../errors/app-error.js';
import Admin from '../models/admin.model.js';
import loginAttemptService from './login-attempt.service.js';
import { generateOtp, randomUuid, sha256 } from '../utils/crypto.js';
import { loginOtpTemplate } from '../templates/login-otp.template.js';

class LoginOtpService {

  async create({ modelType, modelId, email, ipAddress, userAgent,
  // Important for resend
  resendCount = 0,
  lastResentAt = null }) {
  /**
   * Invalidate previous unused OTPs.
   */
  await LoginOtp.updateMany(
    {
      model_type: modelType,
      model_id: modelId,
      used_at: null
    },
    {
      $set: { used_at: new Date() }
    }
  );

  const otp = generateOtp();
  const challengeId = randomUuid();
  const expiresAt = new Date( Date.now() + env.loginOtp.expiresMinutes * 60 * 1000 );

  await LoginOtp.create({
    model_type: modelType,
    model_id: modelId,
    challenge_id: challengeId,
    otp_hash: sha256(otp),
    attempts: 0,
    resend_count: resendCount,
    last_resent_at: lastResentAt,
    expires_at: expiresAt,
    ip_address: ipAddress || null,
    user_agent: userAgent || null
  });

  const profile = await AdminProfile.findOne({ admin_id: modelId }).lean();
  const template = loginOtpTemplate({
      firstName: profile?.first_name || 'User',
      otp,
      expiresMinutes: env.loginOtp.expiresMinutes
    });

  await mailService.send({ to: email, ...template });
  return { challengeId, expiresAt, resendCount };
}

  async verify({ challengeId, otp }) {
    const challenge = await LoginOtp.findOne({
        challenge_id: challengeId,
        used_at: null });

    if (!challenge) {
      throw new AppError('OTP challenge is invalid or expired.', 400, 'INVALID_OTP_CHALLENGE');
    }

    if ( challenge.expires_at <= new Date() ) {
      challenge.used_at = new Date();
      await challenge.save();
      throw new AppError( 'OTP has expired.', 400, 'OTP_EXPIRED' );
    }

    if (challenge.attempts >= env.loginOtp.maxAttempts) {
      challenge.used_at = new Date();
      await challenge.save();
      throw new AppError('Maximum OTP attempts exceeded.', 429, 'OTP_MAX_ATTEMPTS');
    }

    const providedHash = sha256(otp);

    if ( providedHash !== challenge.otp_hash ) {
      challenge.attempts += 1;
      await challenge.save();
      const remaining = env.loginOtp.maxAttempts - challenge.attempts;
      throw new AppError('Invalid OTP.', 401, 'INVALID_OTP', { remaining_attempts: Math.max( remaining, 0 ) });
    }

    challenge.verified_at = new Date();
    challenge.used_at = new Date();
    await challenge.save();
    return challenge;
  }

async resend({ challengeId, ipAddress, userAgent }) {
  /**
   * We intentionally find even a used OTP,
   * because max OTP attempts may have already
   * invalidated it.
   */
  const oldChallenge = await LoginOtp.findOne({ challenge_id: challengeId });
  if (!oldChallenge) {
    throw new AppError( 'OTP challenge does not exist.', 400, 'INVALID_OTP_CHALLENGE' );
  }

  /**
   * Find account.
   */
  const admin = await Admin.findOne({
      id: oldChallenge.model_id,
      deleted_at: null
    });

  if (!admin) { 
    throw new AppError( 'Account not found.', 404, 'ACCOUNT_NOT_FOUND' );
  }

  /**
   * Check whether the account is already
   * temporarily locked.
   *
   * This will also automatically unlock
   * the account once the configured
   * lock duration has passed.
   */
  const lockStatus = await loginAttemptService.isCurrentlyLocked(
        oldChallenge.model_type,
        oldChallenge.model_id );

  if (lockStatus.locked) {
    throw new AppError( 'Account is temporarily locked.', 423, 'ACCOUNT_LOCKED', { unlock_at: lockStatus.unlockAt } );
  }

  /**
   * =========================================
   * 1-MINUTE RESEND COOLDOWN
   * =========================================
   */
  if (oldChallenge.last_resent_at) {
    const cooldownMs = env.loginOtp.resendCooldownSeconds * 1000;
    const nextAllowedAt = oldChallenge.last_resent_at.getTime() + cooldownMs;

    if ( Date.now() < nextAllowedAt ) {
      const remainingSeconds = Math.ceil(( nextAllowedAt - Date.now()) / 1000 );
      throw new AppError(`Please wait ${remainingSeconds} seconds before requesting another OTP.`, 429, 'OTP_RESEND_COOLDOWN',
        { retry_after_seconds: remainingSeconds,
          retry_at: new Date(nextAllowedAt) }
      );
    }
  }

  /**
   * Calculate next resend count.
   */
  const nextResendCount = oldChallenge.resend_count + 1;

  /**
   * =========================================
   * MAX 3 RESENDS
   * =========================================
   *
   * On resend #3:
   * lock the account.
   */
  if ( nextResendCount >= env.loginOtp.maxResends ) {
    oldChallenge.resend_count = nextResendCount;
    oldChallenge.last_resent_at = new Date();
    oldChallenge.used_at = new Date();

    await oldChallenge.save();

    const lock = await loginAttemptService.lockAccount(
          oldChallenge.model_type,
          oldChallenge.model_id );

    throw new AppError('Maximum OTP resend attempts exceeded. Your account has been temporarily locked.', 423, 'OTP_RESEND_LIMIT_EXCEEDED',
      { resend_count: nextResendCount,
        max_resends:env.loginOtp.maxResends,
        unlock_at: lock.unlockAt
      }
    );
  }

  /**
   * Mark old challenge as used.
   */
  oldChallenge.used_at = new Date();
  oldChallenge.last_resent_at = new Date();
  oldChallenge.resend_count = nextResendCount;
  await oldChallenge.save();

  /**
   * Generate NEW challenge.
   *
   * IMPORTANT:
   * Carry the resend_count forward.
   *
   * Otherwise users could bypass
   * the resend limit.
   */
  return this.create({
    modelType: oldChallenge.model_type,
    modelId: oldChallenge.model_id,
    email: admin.email,
    ipAddress,
    userAgent,
    resendCount: nextResendCount,
    lastResentAt: new Date()
  });
}

}

export default new LoginOtpService();