import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    guard_name: { type: String, default: 'api' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Permission = mongoose.model('Permission', permissionSchema,'permissions');
export default Permission;