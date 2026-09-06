import BaseModel from './base.model.js';
import { ROLE_VALUES } from '../enums/role.enum.js';

export default class RoleModel extends BaseModel {
  constructor({
    id,
    name,
    guard_name = 'api',
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();

    const roleId = Number(id);
    if (!ROLE_VALUES.includes(roleId)) { throw new Error('Invalid role id.') }

    this.id = roleId;
    this.name = name.trim();
    this.guard_name = guard_name;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return RoleModel.clean({
      id: this.id,
      name: this.name,
      guard_name: this.guard_name,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new RoleModel({ ...doc.data(), id: doc.data().id ?? Number(doc.id) });
  }
  
  static documentId(id) { return String(id) }
}