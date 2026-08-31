import mongoose from 'mongoose';
import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

const userHasRoleSchema = new mongoose.Schema(
  {
    role_id: { type: Number, required: true, index: true },
    model_type: { type: String, required: true, enum: MODEL_TYPE_VALUES, index: true },
    model_id: { type: String, required: true, index: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

userHasRoleSchema.index({ role_id: 1, model_type: 1, model_id: 1 }, { unique: true });
const UserHasRole = mongoose.model('UserHasRole', userHasRoleSchema, 'user_has_roles');
export default UserHasRole;