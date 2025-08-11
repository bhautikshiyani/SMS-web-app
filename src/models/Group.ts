import mongoose, { Schema, model, Document } from 'mongoose';

interface IGroup extends Document {
  name: string;
  description?: string;
  phoneNumber?: string; 
  users: mongoose.Types.ObjectId[];
  tenantId: string;      
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: false }, 
    description: { type: String },
    phoneNumber: { type: String, default: '' },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tenantId: { type: String, required: true },  
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

groupSchema.index({ name: 1, tenantId: 1 }, { unique: true }); 

export default mongoose.models.Group || model<IGroup>('Group', groupSchema);
