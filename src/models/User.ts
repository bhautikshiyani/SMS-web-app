import mongoose, { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  tenantId: string | null;
  isFirstLogin: boolean;
  tempPasswordExpiresAt?: Date;
  isDeleted: boolean;
  lastLogin?: Date | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true }, 
    password: { type: String, required: true },
    role: { type: String, default: 'OrgUser' },
    tenantId: { type: String, required: function () { return this.role !== 'SuperAdmin'; }, default: null },
    isFirstLogin: { type: Boolean, default: true },
    tempPasswordExpiresAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.User || model<IUser>('User', userSchema);
