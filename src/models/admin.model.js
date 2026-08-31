import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';

const adminSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, immutable: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    is_active: { type: Boolean, default: false, index: true },
    email_verified_at: { type: Date, default: null },
    password: { type: String, required: true, select: false },
    token_version: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null, index: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash( this.password, env.bcryptSaltRounds );
});

adminSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare( plainPassword, this.password );
};

adminSchema.set('toJSON', {
  transform(_document, returned) { delete returned.password;
    return returned;
  }
});

const Admin = mongoose.model('Admin', adminSchema, 'admins');
export default Admin;