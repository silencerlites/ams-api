import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true, unique: true, index: true, ref: 'Admin' },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    middle_name: { type: String, default: null, trim: true },
    ext_name: { type: String, default: null, trim: true },
    profile_picture_path: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema, 'admin_profiles');
export default AdminProfile;