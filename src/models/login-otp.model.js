import mongoose from 'mongoose';

import { MODEL_TYPE_VALUES } from '../constants/model-types.js';

const loginOtpSchema = new mongoose.Schema(
  {
    model_type: { type: String, required: true, enum: MODEL_TYPE_VALUES, index: true },
    model_id: { type: String, required: true, index: true },
    challenge_id: { type: String, required: true, unique: true, index: true },
    otp_hash: { type: String, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    resend_count: { type: Number, default: 0, min: 0 },
    last_resent_at: { type: Date, default: null },
    expires_at: { type: Date, required: true },
    verified_at: { type: Date, default: null },
    used_at: { type: Date, default: null },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

loginOtpSchema.index({ expires_at: 1 },{ expireAfterSeconds: 0 });
loginOtpSchema.index({ model_type: 1, model_id: 1 });
const LoginOtp = mongoose.model('LoginOtp', loginOtpSchema,'login_otps');
export default LoginOtp;