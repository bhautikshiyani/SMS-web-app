import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import Group from '@/models/Group';
import Tenant from '@/models/Tenant';

interface GroupDoc {
  _id: string;
  name: string;
  description?: string;
  tenantId: {
    _id: string;
    name?: string;
  };
  isDeleted?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ 
    status: string; 
    data?: GroupDoc | GroupDoc[]; 
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
      const { id, tenantId } = req.query;

      if (id && typeof id === 'string') {
        if (currentUser.role !== 'SuperAdmin') {
          const requestedGroup = await Group.findById(id).select('tenantId');
          if (!requestedGroup || requestedGroup.tenantId?.toString() !== currentUser.tenantId) {
            return res.status(403).json({ 
              status: 'error', 
              message: 'Forbidden: cannot access this group' 
            });
          }
        }

        const group = await Group.findById(id)
          .select('-__v')
          .populate({
            path: 'tenantId',
            model: Tenant,
            select: 'name'
          })
          .lean<GroupDoc>();

        if (!group || group.isDeleted) {
          return res.status(404).json({ status: 'error', message: 'Group not found' });
        }

        return res.status(200).json({ status: 'success', data: group });

      } else if (tenantId && typeof tenantId === 'string') {
        if (currentUser.role !== 'SuperAdmin' && currentUser.tenantId !== tenantId) {
          return res.status(403).json({ 
            status: 'error', 
            message: 'Forbidden: cannot access resources outside your tenant' 
          });
        }

        const groups = await Group.find({ 
          tenantId,
          isDeleted: { $ne: true } 
        })
          .select('-__v')
          .populate({
            path: 'tenantId',
            model: Tenant,
            select: 'name'
          })
          .lean<GroupDoc[]>();

        return res.status(200).json({ status: 'success', data: groups });

      } else {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Either id or tenantId must be provided' 
        });
      }

    } catch (err) {
      console.error('Error fetching groups:', err);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal Server Error' 
      });
    }
  }

  return res.status(405).json({ 
    status: 'error', 
    message: 'Method not allowed' 
  });
}