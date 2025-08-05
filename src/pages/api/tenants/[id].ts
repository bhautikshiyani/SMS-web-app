import type { NextApiRequest, NextApiResponse } from 'next';
import Tenant from '@/models/Tenant';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

function sendError(res: NextApiResponse, statusCode: number, message: string) {
  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    const { id } = req.query;

    const authHeader = req.headers.authorization;
    if (!authHeader) return sendError(res, 401, 'No token provided');

    const token = authHeader.split(' ')[1];
    const user = verifyJwt(token);
    if (!user) return sendError(res, 401, 'Invalid token');

    const isTenantOwner = user.tenantId === id;
    const isSuperAdmin = user.role === 'SuperAdmin';

    if (req.method === 'GET') {
      if (!isSuperAdmin && !isTenantOwner) {
        return sendError(res, 403, 'Forbidden: insufficient permissions');
      }

      const tenant = await Tenant.findById(id);
      if (!tenant) return sendError(res, 404, 'Tenant not found');

      return res.status(200).json({ status: 'success', data: tenant });
    } 
    else if (req.method === 'PUT') {
      if (!isSuperAdmin && !isTenantOwner) {
        return sendError(res, 403, 'Forbidden: insufficient permissions');
      }

      const updateData = req.body;
      const tenant = await Tenant.findByIdAndUpdate(id, updateData, { new: true });
      if (!tenant) return sendError(res, 404, 'Tenant not found');

      return res.status(200).json({ status: 'success', data: tenant });
    } 
    else if (req.method === 'DELETE') {
      if (!isSuperAdmin) {
        return sendError(res, 403, 'Forbidden: only SuperAdmin can delete');
      }

      const tenant = await Tenant.findByIdAndDelete(id);
      if (!tenant) return sendError(res, 404, 'Tenant not found');

      return res.status(200).json({ status: 'success', message: 'Tenant deleted' });
    } 
    else {
      return sendError(res, 405, 'Method not allowed');
    }
  } catch (error: any) {
    console.error('Tenant API error:', error);
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
}
