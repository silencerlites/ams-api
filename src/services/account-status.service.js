import Admin from '../models/admin.model.js';
import UserHasStatus from '../models/user-has-status.model.js';

import { AccountStatus, statusIsActive } from '../enums/account-status.enum.js';
import { MODEL_TYPES } from '../constants/model-types.js';

class AccountStatusService {

  async setStatus({ modelType, modelId, status, session = null }) {
    const result = await UserHasStatus.findOneAndUpdate(
      { model_type: modelType, model_id: modelId },
      { $set: { status } },
      { returnDocument: 'after', upsert: true, session, setDefaultsOnInsert: true });

    await this.syncAccountActivity({ modelType, modelId, status, session });
    return result;
  }

  async syncAccountActivity({ modelType, modelId, status, session = null }) {
    const isActive = statusIsActive(status);

    switch (modelType) {
      case MODEL_TYPES.ADMIN:
        await Admin.updateOne(
          { id: modelId },
          { $set: { is_active: isActive, ...(status === AccountStatus.DELETED ? { deleted_at: new Date() } : {}) } },
          { session });

        break;

      default: throw new Error(`Unsupported model type: ${modelType}`);
    }
  }

  async getStatus(modelType, modelId) {
    return UserHasStatus.findOne({ model_type: modelType, model_id: modelId }).lean();
  }

  async activate(modelType, modelId) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.ACTIVE });
  }

  async lock(modelType, modelId) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.LOCKED });
  }

  async deactivate(modelType, modelId) {
    return this.setStatus({ modelType, modelId, status: AccountStatus.DEACTIVATED });
  }
}

export default new AccountStatusService();