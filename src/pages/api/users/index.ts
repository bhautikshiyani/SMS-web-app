import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ status: 'error', message: 'No token provided' });

  const user = verifyJwt(token);
  if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Admin')) {
    return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
  }

  const { name, email, password, role, tenantId } = req.body;
  if (!name || !email || !password || !role || !tenantId) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const existing = await User.findOne({ email, isDeleted: false });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'User with this email already exists' });
    }

    const newUser = new User({ name, email, password, role, tenantId, isDeleted: false });
    await newUser.save();

    return res.status(201).json({ status: 'success', data: newUser.toObject() });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  }
}
