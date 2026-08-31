import mongoose from 'mongoose';

const revokedAccessTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    model_type: { type: String, required: true, index: true },
    model_id: { type: String, required: true, index: true },
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

revokedAccessTokenSchema.index({ expires_at: 1 },{ expireAfterSeconds: 0 });
const RevokedAccessToken = mongoose.model('RevokedAccessToken', revokedAccessTokenSchema,'revoked_access_tokens');
export default RevokedAccessToken;