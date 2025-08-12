import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoneAssignment extends Document {
  phoneNumber: string;
  tenantId: mongoose.Types.ObjectId;
  assignedToType: 'user' | 'group';
  assignedToId: mongoose.Types.ObjectId;
  assignedByName: string;
  assignedById: mongoose.Types.ObjectId;
  assignedAt: Date;
  isActive: boolean;
}

const PhoneAssignmentSchema = new Schema<IPhoneAssignment>({
  phoneNumber: { type: String, required: true, unique: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assignedToType: { type: String, enum: ['user', 'group'], required: true },
  assignedToId: { type: Schema.Types.ObjectId, required: true },
  assignedByName: { type: String, required: true },
  assignedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

export default mongoose.models.PhoneAssignment || 
  mongoose.model<IPhoneAssignment>('PhoneAssignment', PhoneAssignmentSchema);