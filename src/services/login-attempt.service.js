// src/services/login-attempt.service.js

import env from '../config/env.js';

import loginAttemptRepository from '../repositories/login-attempt.repository.js';

import accountStatusService from './account-status.service.js';

import {
  AccountStatus
} from '../enums/account-status.enum.js';


class LoginAttemptService {

  lockDurationMs() {
    return env.accountLockMinutes * 60 * 1000;
  }


  async getOrCreate(
    modelType,
    modelId
  ) {
    return loginAttemptRepository
      .getOrCreate(
        modelType,
        modelId
      );
  }


  async isCurrentlyLocked(
    modelType,
    modelId
  ) {
    const record =
      await this.getOrCreate(
        modelType,
        modelId
      );

    if (!record.locked_at) {
      return {
        locked: false,
        record
      };
    }


    const lockedAt =
      record.locked_at instanceof Date
        ? record.locked_at
        : record.locked_at.toDate();


    const unlockAt =
      lockedAt.getTime() +
      this.lockDurationMs();


    if (Date.now() >= unlockAt) {
      await this.reset(
        modelType,
        modelId
      );

      await accountStatusService.setStatus({
        modelType,
        modelId,
        status:
          AccountStatus.ACTIVE
      });

      return {
        locked: false,
        unlocked: true
      };
    }


    return {
      locked: true,

      unlockAt:
        new Date(unlockAt),

      remainingMs:
        unlockAt - Date.now(),

      record
    };
  }


  async registerFailure(
    modelType,
    modelId
  ) {
    const record =
      await loginAttemptRepository
        .incrementFailure(
          modelType,
          modelId
        );


    if (
      record.attempts >=
      env.maxLoginAttempts
    ) {
      const now =
        new Date();

      await loginAttemptRepository
        .lock(
          modelType,
          modelId,
          now
        );


      await accountStatusService.lock(
        modelType,
        modelId
      );


      return {
        locked:
          true,

        attempts:
          record.attempts,

        unlockAt:
          new Date(
            now.getTime() +
            this.lockDurationMs()
          )
      };
    }


    return {
      locked:
        false,

      attempts:
        record.attempts,

      remaining:
        env.maxLoginAttempts -
        record.attempts
    };
  }


  async reset(
    modelType,
    modelId
  ) {
    await loginAttemptRepository
      .reset(
        modelType,
        modelId
      );
  }


  async lockAccount(
    modelType,
    modelId
  ) {
    const now =
      new Date();

    await loginAttemptRepository
      .lock(
        modelType,
        modelId,
        now
      );


    await accountStatusService.lock(
      modelType,
      modelId
    );


    return {
      locked:
        true,

      lockedAt:
        now,

      unlockAt:
        new Date(
          now.getTime() +
          this.lockDurationMs()
        )
    };
  }
}


export default new LoginAttemptService();