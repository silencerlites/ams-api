import { db } from '../config/firebase.js';
import AdminProfileModel from '../models/admin-profile.model.js';

const COLLECTION = 'admin_profiles';

class AdminProfileRepository {
  async findByAdminId(adminId) {
    const doc = await db.collection(COLLECTION).doc(String(adminId)).get();
    return AdminProfileModel.fromFirestore(doc);
  }


  async create(payload, transaction = null) {
    const profile = payload instanceof AdminProfileModel ? payload : new AdminProfileModel(payload);
    const ref = db.collection(COLLECTION).doc(String(profile.admin_id));

    const data = {
      ...profile.toFirestore(),
      created_at: profile.created_at ?? new Date(),
      updated_at: profile.updated_at ?? new Date()
    };

    if (transaction) {
      transaction.create(ref, data);
    } else {
      await ref.create(data);
    }

    return profile;
  }

  async update(adminId, payload, transaction = null) {
    const ref = db.collection(COLLECTION).doc(String(adminId));
    const data = {
      ...payload,
      updated_at: new Date()
    };

    if (transaction) {
      transaction.update(ref, data);
      return;
    }

    await ref.update(data);
    return this.findByAdminId(adminId);
  }

  async updateProfilePicture(adminId, profilePicturePath) {
    const ref = db.collection(COLLECTION).doc(String(adminId));
    await ref.update({
      profile_picture_path: profilePicturePath ?? null,
      updated_at: new Date()
    });

    return this.findByAdminId(adminId);
  }

  async deleteProfilePicture(adminId) {
    return this.updateProfilePicture(adminId, null);
  }

  async deletePermanently(adminId) {
    await db.collection(COLLECTION).doc(String(adminId)).delete();
  }
}


export default new AdminProfileRepository();