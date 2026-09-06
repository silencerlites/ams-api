import BaseModel from './base.model.js';

export default class AdminModel extends BaseModel {
  constructor({
    id,
    uid,
    email,
    is_active = false,
    token_version = 0,
    deleted_at = null,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();

    this.id = String(id);
    this.uid = uid;
    this.email = email.trim().toLowerCase();
    this.is_active = is_active;
    this.token_version = token_version;
    this.deleted_at = deleted_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return AdminModel.clean({
      id: this.id,
      uid: this.uid,
      email: this.email,
      is_active: this.is_active,
      token_version: this.token_version,
      deleted_at: this.deleted_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) { return null; }
    return new AdminModel({ ...doc.data(), id: doc.id });
  }
}