import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'SuperAdmin' | 'Admin' | 'OrgManager' | 'OrgUser';
  tenantId: Schema.Types.ObjectId;
  phone?: string;
  avatar?: string;
  isFirstLogin: boolean;
  isDeleted: boolean;
  tempPasswordExpiresAt?: Date;  
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin', 'OrgManager', 'OrgUser'],
      default: 'OrgUser',
    },

    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },

    phone: { type: String },
    avatar: { type: String },

    isFirstLogin: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    tempPasswordExpiresAt: { type: Date }, 
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);
export default User;
