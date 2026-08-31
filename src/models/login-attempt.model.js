import mongoose from 'mongoose';

import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

const loginAttemptSchema = new mongoose.Schema(
  {
    model_type: { type: String, required: true, enum: MODEL_TYPE_VALUES, index: true },
    model_id: { type: String, required: true, index: true },
    attempts: { type: Number, default: 0, min: 0 },
    last_attempt_at: { type: Date, default: null },
    locked_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

loginAttemptSchema.index({ unique: true });
const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema, 'user_has_login_attempts');
export default LoginAttempt;