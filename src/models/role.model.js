import mongoose from 'mongoose';
import { ROLE_VALUES } from '../enums/role.enum.js';

const roleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, enum: ROLE_VALUES },
    name: { type: String, required: true, unique: true, trim: true },
    guard_name: { type: String, default: 'api' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

const Role = mongoose.model('Role', roleSchema,'roles');
export default Role;