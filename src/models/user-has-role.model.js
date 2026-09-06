import BaseModel from './base.model.js';
import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

export default class UserHasRoleModel extends BaseModel {
  constructor({
    role_id,
    model_type,
    model_id,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();

    if (!MODEL_TYPE_VALUES.includes(model_type)) { throw new Error('Invalid model_type.') }
    this.role_id = Number(role_id);
    this.model_type = model_type;
    this.model_id = String(model_id);
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return UserHasRoleModel.clean({
      role_id: this.role_id,
      model_type: this.model_type,
      model_id: this.model_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new UserHasRoleModel(doc.data())
  }

  static documentId({ role_id, model_type, model_id }) {
    return `${model_type}_${model_id}_${role_id}`;
  }
}