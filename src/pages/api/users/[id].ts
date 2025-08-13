import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  tenant?: any;
  isDeleted?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    status: string;
    data?: UserDoc | UserDoc[];
    message?: string
  }>
) {
  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const currentUser = verifyJwt(token);
  if (!currentUser) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ status: 'error', message: 'User ID is required' });
      }

      const user = await User.findById(id)
        .select('-password -__v')
        .populate({
          path: 'tenantId',
          model: Tenant
        })
        .lean<UserDoc & { tenantId?: any }>();

      if (!user || user.isDeleted) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      if (currentUser.role !== 'SuperAdmin' &&
        user.tenantId?._id.toString() !== currentUser.tenantId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: cannot access this user' });
      }

      const { tenantId: tenant, ...rest } = user;
      return res.status(200).json({ status: 'success', data: { ...rest, tenant } });

    } catch (err) {
      console.error('Error fetching user by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
}
