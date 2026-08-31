import env from '../config/env.js';
import LoginAttempt from '../models/login-attempt.model.js';
import accountStatusService from './account-status.service.js';
import { AccountStatus } from '../enums/account-status.enum.js';

class LoginAttemptService {
  lockDurationMs() { return (env.accountLockMinutes * 60 * 1000); }

  async getOrCreate(modelType, modelId) {
    return LoginAttempt.findOneAndUpdate(
      {
        model_type: modelType,
        model_id: modelId
      },
      { $setOnInsert: { attempts: 0, last_attempt_at: null, locked_at: null } },
      { returnDocument: 'after', upsert: true });
  }

  async isCurrentlyLocked(modelType, modelId) {
    const record = await this.getOrCreate(modelType, modelId);

    if (!record.locked_at) {
      return { locked: false, record };
    }

    const unlockAt = record.locked_at.getTime() + this.lockDurationMs();

    if (Date.now() >= unlockAt) {
      await this.reset(modelType, modelId);
      await accountStatusService.setStatus({ modelType, modelId, status: AccountStatus.ACTIVE });
      return { locked: false, unlocked: true };
    }

    return { locked: true, unlockAt: new Date(unlockAt), remainingMs: unlockAt - Date.now(), record };
  }

  async registerFailure(modelType, modelId) {
    const record = await LoginAttempt.findOneAndUpdate(
      {
        model_type: modelType,
        model_id: modelId
      },
      {
        $inc: { attempts: 1 },
        $set: { last_attempt_at: new Date() }
      },
      {
        returnDocument: 'after',
        upsert: true
      });

    if (record.attempts >= env.maxLoginAttempts) {
      record.locked_at = new Date();
      await record.save();
      await accountStatusService.lock(modelType, modelId);
      return { locked: true, attempts: record.attempts, unlockAt: new Date(Date.now() + this.lockDurationMs()) };
    }

    return { locked: false, attempts: record.attempts, remaining: env.maxLoginAttempts - record.attempts };
  }

  async reset(modelType, modelId) {
    await LoginAttempt.findOneAndUpdate(
      { model_type: modelType,
        model_id: modelId },
      { $set: { attempts: 0, last_attempt_at: null, locked_at: null }},
      { upsert: true }
    );
  }

  async lockAccount( modelType, modelId ) {
    const now = new Date();

    await LoginAttempt.findOneAndUpdate(
      { model_type: modelType,
        model_id: modelId },
      { $set: { locked_at: now, last_attempt_at: now } },
      { upsert: true, returnDocument: 'after' }
    );

    await accountStatusService.lock( modelType, modelId );
    return { locked: true, lockedAt: now, unlockAt: new Date(now.getTime() + this.lockDurationMs())};
  }
}

export default new LoginAttemptService();