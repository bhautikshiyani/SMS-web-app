import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import Group from '@/models/Group';
import Tenant from '@/models/Tenant';

interface GroupDoc {
  _id: string;
  name: string;
  description?: string;
  tenant?: {
    _id: string;
    name?: string;
    [key: string]: any;
  };
  isDeleted?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ 
    status: string; 
    data?: GroupDoc; 
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
        return res.status(400).json({ status: 'error', message: 'Group ID is required' });
      }

      const group = await Group.findById(id)
        .select('-__v')
        .populate({
          path: 'tenantId',
          model: Tenant,
          select: '-__v -createdAt -updatedAt'
        })
        .lean<any>(); 

      if (!group || group.isDeleted) {
        return res.status(404).json({ status: 'error', message: 'Group not found' });
      }

      if (currentUser.role !== 'SuperAdmin' && group.tenantId._id.toString() !== currentUser.tenantId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: cannot access this group' });
      }

      const { tenantId, ...rest } = group;
      const responseData: GroupDoc = { ...rest, tenant: tenantId };

      return res.status(200).json({ status: 'success', data: responseData });

    } catch (err) {
      console.error('Error fetching group:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ status: 'error', message: 'Method not allowed' });
}
