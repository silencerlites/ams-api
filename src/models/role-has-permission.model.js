import mongoose from 'mongoose';

const roleHasPermissionSchema = new mongoose.Schema(
  {
    role_id: { type: Number, required: true, index: true },
    permission_id: { type: Number, required: true, index: true }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

roleHasPermissionSchema.index({ role_id: 1, permission_id: 1 },{ unique: true });
const RoleHasPermission = mongoose.model('RoleHasPermission', roleHasPermissionSchema,'role_has_permissions');
export default RoleHasPermission;