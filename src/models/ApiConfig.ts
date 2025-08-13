import mongoose from 'mongoose';

export interface IApiConfig extends mongoose.Document {
  apiKey: string;
  apiSecret: string;
  userId: mongoose.Types.ObjectId;  // Added userId field
  lastUpdatedBy: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
  createdAt: Date;  // Added for tracking creation time
}

const ApiConfigSchema = new mongoose.Schema<IApiConfig>(
  {
    apiKey: { 
      type: String, 
      required: true 
    },
    apiSecret: { 
      type: String, 
      required: true 
    },
    userId: {  // Added userId field to schema
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true  // Ensures one config per user
    },
    lastUpdatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    lastUpdatedAt: { 
      type: Date, 
      default: Date.now 
    },
    createdAt: {  // Added for upsert detection
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false, // Disable automatic timestamps since we manage them manually
    versionKey: false // Disable version key (__v)
  }
);

// Add index on userId for faster queries
ApiConfigSchema.index({ userId: 1 }, { unique: true });

const ApiConfig = mongoose.models.ApiConfig || 
                  mongoose.model<IApiConfig>('ApiConfig', ApiConfigSchema);

export default ApiConfig;