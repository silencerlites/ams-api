import mongoose from 'mongoose';

import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

const emailVerificationTokenSchema = new mongoose.Schema(
  {
    model_type: { type: String, required: true, enum: MODEL_TYPE_VALUES, index: true },
    model_id: { type: String, required: true, index: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    expires_at: { type: Date, required: true },
    used_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

emailVerificationTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
const EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema, 'email_verification_tokens');
export default EmailVerificationToken;