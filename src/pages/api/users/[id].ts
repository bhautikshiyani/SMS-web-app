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
  tenantId?: {
    _id: string;
    name?: string;
    [key: string]: any;
  } | null;
  isDeleted?: boolean;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ status: 'error', message: 'User ID is required' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const currentUser = verifyJwt(token);
  if (!currentUser || (currentUser.role !== 'SuperAdmin' && currentUser.role !== 'Admin')) {
    return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
  }

  try {
    const user = await User.findById(id)
      .select('-password')
      .populate({
        path: 'tenantId',
        model: Tenant,
        select: '-__v -createdAt -updatedAt',
      })
      .lean<UserDoc | null>();

    if (!user || user.isDeleted) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (
      currentUser.role === 'Admin' &&
      currentUser.tenantId !== user.tenantId?._id.toString()
    ) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: user not in your tenant' });
    }

    const { tenantId, ...rest } = user;
    const responseUser = {
      ...rest,
      tenant: tenantId,
      tenantId: tenantId?._id || null,
    };

    return res.status(200).json({ status: 'success', data: responseUser });
  } catch (err: any) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  }
}
