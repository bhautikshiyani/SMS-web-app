import  { Schema, model, models } from 'mongoose';

export interface ITenant {
  name: string;
  logoUrl?: string;
  sinchApiKey: string;
  sinchApiSecret: string;
  featureToggles: {
    messages: boolean;
    contacts: boolean;
    voicemail: boolean;
    phone: boolean;
  };
  retentionPeriodYears: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    sinchApiKey: { type: String, required: true },
    sinchApiSecret: { type: String, required: true },
    featureToggles: {
      messages: { type: Boolean, default: true },
      contacts: { type: Boolean, default: true },
      voicemail: { type: Boolean, default: true },
      phone: { type: Boolean, default: true },
    },
    retentionPeriodYears: { type: Number, default: 7 },
  },
  { timestamps: true }
);

const Tenant = models.Tenant || model<ITenant>('Tenant', TenantSchema);

export default Tenant;
