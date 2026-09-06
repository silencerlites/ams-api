import BaseModel from './base.model.js';

export default class AdminProfileModel extends BaseModel {
  constructor({
    admin_id,
    first_name,
    last_name,
    middle_name = null,
    ext_name = null,
    profile_picture_path = null,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();
    this.admin_id = String(admin_id);
    this.first_name = first_name.trim();
    this.last_name = last_name.trim();
    this.middle_name = middle_name?.trim() || null;
    this.ext_name = ext_name?.trim() || null;
    this.profile_picture_path = profile_picture_path;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toFirestore() {
    return AdminProfileModel.clean({
      admin_id: this.admin_id,
      first_name: this.first_name,
      last_name: this.last_name,
      middle_name: this.middle_name,
      ext_name: this.ext_name,
      profile_picture_path: this.profile_picture_path,
      created_at: this.created_at,
      updated_at: this.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) { return null; }
    return new AdminProfileModel({ ...doc.data(), admin_id: doc.data().admin_id ?? doc.id });
  }
}