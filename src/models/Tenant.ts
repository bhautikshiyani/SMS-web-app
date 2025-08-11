import { Schema, model, models } from 'mongoose';

export interface ITenant {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  featureToggles: {
    messages: boolean;
    contacts: boolean;
    voicemail: boolean;
    phone: boolean;
  };
  retentionPeriodYears: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    featureToggles: {
      messages: { type: Boolean, default: true },
      contacts: { type: Boolean, default: true },
      voicemail: { type: Boolean, default: true },
      phone: { type: Boolean, default: true },
    },
    retentionPeriodYears: { type: Number, default: 7 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Tenant = models.Tenant || model<ITenant>('Tenant', TenantSchema);
export default Tenant;
