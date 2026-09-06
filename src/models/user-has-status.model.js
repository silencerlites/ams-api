// src/models/user-has-status.model.js

import BaseModel from './base.model.js';
import { ACCOUNT_STATUS_VALUES } from '../enums/account-status.enum.js';

import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

export default class UserHasStatusModel extends BaseModel {
  constructor({
    model_type,
    model_id,
    status,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();

    if (!MODEL_TYPE_VALUES.includes(model_type)) { throw new Error('Invalid model_type.')}
    if (!ACCOUNT_STATUS_VALUES.includes(Number(status))) { throw new Error('Invalid account status.')}

    this.model_type = model_type;
    this.model_id = String(model_id);
    this.status = Number(status);
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return UserHasStatusModel.clean({
      model_type: this.model_type,
      model_id: this.model_id,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new UserHasStatusModel(doc.data())
  }

  static documentId({ model_type, model_id }) {
    return `${model_type}_${model_id}`;
  }
}