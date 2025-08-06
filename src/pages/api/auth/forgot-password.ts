import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
    );
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    await PasswordResetToken.create({ userId: user._id, token, expires });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/resetPassword?token=${token}`;
    console.log('Reset link:', process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD);
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Support" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Password Reset',
        html: `<p>Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.status(200).json({ message: 'Password reset link sent' });
}
