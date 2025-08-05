import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'SuperAdmin' | 'Admin' | 'OrgManager' | 'OrgUser' | 'OrgGroup';
    tenantId: mongoose.Types.ObjectId;
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
            enum: ['SuperAdmin', 'Admin', 'OrgManager', 'OrgUser', 'OrgGroup'],
            default: 'OrgUser',
        },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function (this: mongoose.Document & IUser, next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (
    this: mongoose.Document & IUser,
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model('User', UserSchema);

export default User;
