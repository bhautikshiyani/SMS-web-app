import { Schema, model, models } from 'mongoose';

const PasswordResetTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
}, { timestamps: true });

export default models.PasswordResetToken || model('PasswordResetToken', PasswordResetTokenSchema);
