
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  const { newPassword, confirmPassword } = req.body;
  console.log('Resetting password with body:', req.body);
  const token = req.query.token as string;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ status: 'error', message: 'Passwords do not match' });
  }

  try {
    await dbConnect();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({ status: 'error', message: 'User not found or has been deleted' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ status: 'error', message: 'New password must be different from old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isFirstLogin = false;

    user.tempPasswordExpiresAt = undefined;

    await user.save();

    return res.status(200).json({ status: 'success', message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.log('Error resetting password:', error);
    return res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
  }
}
