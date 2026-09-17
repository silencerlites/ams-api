import BaseModel from './base.model.js';

export default class RoleHasPermissionModel extends BaseModel {
  constructor({ role_id, permission_id }) {
    super();
    this.role_id = Number(role_id);
    this.permission_id = Number(permission_id);
  }

  toFirestore() {
    return RoleHasPermissionModel.clean({ role_id: this.role_id, permission_id: this.permission_id });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new RoleHasPermissionModel( doc.data() )
  }
  
  static documentId({ role_id, permission_id }) {
    return `${role_id}_${permission_id}`;
  }
}