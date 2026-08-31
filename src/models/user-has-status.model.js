import mongoose from 'mongoose';
import { ACCOUNT_STATUS_VALUES } from '../enums/account-status.enum.js';
import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

const userHasStatusSchema = new mongoose.Schema(
  {
    model_type: { type: String, required: true, enum: MODEL_TYPE_VALUES, index: true },
    model_id: { type: String, required: true, index: true },
    status: { type: Number, required: true, enum: ACCOUNT_STATUS_VALUES, index: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

userHasStatusSchema.index({ model_type: 1, model_id: 1 },{ unique: true });
const UserHasStatus = mongoose.model('UserHasStatus', userHasStatusSchema,'users_has_status');
export default UserHasStatus;