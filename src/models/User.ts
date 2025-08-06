import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'SuperAdmin' | 'Admin' | 'OrgManager' | 'OrgUser';
  tenantId: Schema.Types.ObjectId;
  phone?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin', 'OrgManager', 'OrgUser'],
      default: 'OrgUser',
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }, 
    phone: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);
export default User;
