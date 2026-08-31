import mongoose from 'mongoose';

import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenable_type: { type: String, required: true, enum: MODEL_TYPE_VALUES, index: true },
    tokenable_id: { type: String, required: true, index: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    jti: { type: String, required: true, unique: true, index: true },
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date, default: null, index: true },
    replaced_by_jti: { type: String, default: null, index: true },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

refreshTokenSchema.index({tokenable_type: 1, tokenable_id: 1});
refreshTokenSchema.index({tokenable_type: 1, tokenable_id: 1, revoked_at: 1});
refreshTokenSchema.index({ expires_at: 1 },{ expireAfterSeconds: 0 });
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema, 'refresh_tokens');
export default RefreshToken;