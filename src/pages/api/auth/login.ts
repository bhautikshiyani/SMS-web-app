import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  await dbConnect();

  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.isFirstLogin && user.tempPasswordExpiresAt && new Date() > user.tempPasswordExpiresAt) {
    return res.status(403).json({ message: 'Temporary password expired. Please request a password reset.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      tenantId: user.tenantId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isFirstLogin: user.isFirstLogin,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
}
