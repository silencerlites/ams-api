import BaseModel from './base.model.js';
import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

export default class LoginAttemptModel extends BaseModel {
  constructor({
    model_type,
    model_id,
    attempts = 0,
    last_attempt_at = null,
    locked_at = null,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();
    if (!MODEL_TYPE_VALUES.includes(model_type)) { throw new Error('Invalid model_type.') }
    this.model_type = model_type;
    this.model_id = String(model_id);
    this.attempts = attempts;
    this.last_attempt_at = last_attempt_at;
    this.locked_at = locked_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return LoginAttemptModel.clean({
      model_type: this.model_type,
      model_id: this.model_id,
      attempts: this.attempts,
      last_attempt_at: this.last_attempt_at,
      locked_at: this.locked_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null
    return new LoginAttemptModel(doc.data());
  }
  static documentId({ model_type, model_id }) { return `${model_type}_${model_id}` }
}