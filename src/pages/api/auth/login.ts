import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    const { email, password, tenantId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    await dbConnect();

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isDeleted: false,

    });
    console.log('User found:', user);

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ status: 'error', message: 'Your account is disabled. Please contact admin.' });
    }


    if (user.role !== 'SuperAdmin' && !tenantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Tenant ID is required for non-SuperAdmin users'
      });
    }

    if (
      user.role !== 'SuperAdmin' &&
      user.isFirstLogin &&
      user.tempPasswordExpiresAt &&
      new Date() > user.tempPasswordExpiresAt
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Temporary password expired. Please request a password reset.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    // ✅ Token payload includes tenantId only if not SuperAdmin
    const tokenPayload: any = {
      userId: user._id,
      role: user.role
    };
    if (user.role !== 'SuperAdmin') {
      tokenPayload.tenantId = user.tenantId;
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isFirstLogin: user.isFirstLogin,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error'
    });
  }
}

