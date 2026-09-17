import BaseModel from './base.model.js';

export default class PermissionModel extends BaseModel {
  constructor({
    id,
    name,
    guard_name = 'api',
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();

    this.id = Number(id);
    this.name = name.trim();
    this.guard_name = guard_name;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return PermissionModel.clean({
      id: this.id,
      name: this.name,
      guard_name: this.guard_name,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new PermissionModel({ ...doc.data(), id: doc.data().id ?? Number(doc.id) });
  }
  static documentId(id) { return String(id); }
}