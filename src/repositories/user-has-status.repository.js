import { db } from '../config/firebase.js';
import UserHasStatusModel from '../models/user-has-status.model.js';

const COLLECTION = 'users_has_status';

class UserHasStatusRepository {

  getRef( modelType, modelId ) {
    const documentId = UserHasStatusModel.documentId({
        model_type: modelType,
        model_id: modelId
      });

    return db.collection(COLLECTION).doc(documentId);
  }

  async findByModel(modelType, modelId) {
    const doc = await this.getRef(modelType, modelId).get();
    return UserHasStatusModel.fromFirestore(doc);
  }

  async exists(modelType, modelId) {
    const doc = await this.getRef(modelType, modelId).get();
    return doc.exists;
  }

  async create(payload, transaction = null) {
    const status = payload instanceof UserHasStatusModel ? payload : new UserHasStatusModel(payload);
    const ref = this.getRef(status.model_type, status.model_id);
    const data = status.toFirestore();

    if (transaction) {
      transaction.create(ref, data);
    } else {
      await ref.create(data);
    }

    return status;
  }


  async upsert(payload, transaction = null) {
    const status = payload instanceof UserHasStatusModel ? payload : new UserHasStatusModel(payload);
    const ref = this.getRef(status.model_type, status.model_id);
    const data = { ...status.toFirestore(), updated_at: new Date()};

    if (transaction) { 
      transaction.set(ref, data,
        { merge: true });
      return status;
    }

    await ref.set(data, {
        merge: true });

    return this.findByModel(
      status.model_type,
      status.model_id
    );
  }


  async update(modelType, modelId, payload, transaction = null) {
    const ref = this.getRef(modelType, modelId);
    const data = {
      ...payload,
      updated_at: new Date()
    };

    if (transaction) {
      transaction.update(ref, data);
      return;
    }
    await ref.update(data);
    return this.findByModel(modelType, modelId);
  }

  async setStatus(modelType, modelId, status, transaction = null) {
    return this.upsert({
        model_type: modelType,
        model_id: modelId,
        status },
      transaction
    );
  }
  async delete(modelType, modelId) {
    await this.getRef(modelType, modelId).delete();
  }
}

export default new UserHasStatusRepository();