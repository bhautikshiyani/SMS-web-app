import mongoose from 'mongoose';

export interface IApiConfig extends mongoose.Document {
  apiKey: string;
  apiSecret: string;
  lastUpdatedBy: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
}

const ApiConfigSchema = new mongoose.Schema<IApiConfig>({
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdatedAt: { type: Date, default: Date.now }
});

const ApiConfig = mongoose.models.ApiConfig || mongoose.model<IApiConfig>('ApiConfig', ApiConfigSchema);

export default ApiConfig;
