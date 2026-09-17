import adminRepository from '../repositories/admin.repository.js';
import userHasStatusRepository from '../repositories/user-has-status.repository.js';
import { AccountStatus, statusIsActive } from '../enums/account-status.enum.js';
import { MODEL_TYPES } from '../constants/model-types.js';
import AppError from '../errors/app-error.js';

class AccountStatusService {
  async setStatus({ modelType, modelId, status, transaction = null }) {
    const result = await userHasStatusRepository.upsert({
          model_type: modelType,
          model_id: modelId,
          status }, transaction);

    await this.syncAccountActivity({ modelType, modelId, status, transaction });
    return result;
  }

  async syncAccountActivity({ modelType, modelId, status, transaction = null }) {
    const isActive = statusIsActive(status);

    switch (modelType) {
      case MODEL_TYPES.ADMIN: {
        const payload = { is_active: isActive,
          ...(status === AccountStatus.DELETED ? { deleted_at: new Date() } : {})};

        await adminRepository.update( modelId, payload, transaction);
        return;
      }

      default: throw new AppError(`Unsupported model type: ${modelType}`, 400, 'ACCOUNT_TYPE_NOT_SUPPORTED');
    }
  }

  async getStatus(modelType, modelId) {
    return userHasStatusRepository.findByModel(modelType, modelId);
  }

  async activate(modelType, modelId) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.ACTIVE });
  }

  async lock(modelType, modelId) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.LOCKED });
  }

  async deactivate( modelType, modelId ) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.DEACTIVATED });
  }

  async markDeleted( modelType, modelId ) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.DELETED });
  }
}

export default new AccountStatusService();