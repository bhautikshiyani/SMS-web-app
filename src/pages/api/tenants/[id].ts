import type { NextApiRequest, NextApiResponse } from 'next';
import Tenant from '@/models/Tenant';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';

function sendError(res: NextApiResponse, statusCode: number, message: string) {
  return res.status(statusCode).json({ status: 'error', statusCode, message });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    const { id } = req.query;
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) return sendError(res, 400, 'Invalid tenant ID');

    const authHeader = req.headers.authorization;
    if (!authHeader) return sendError(res, 401, 'No token provided');

    const token = authHeader.split(' ')[1];
    const user = verifyJwt(token);
    if (!user) return sendError(res, 401, 'Invalid token');

    const tenantQuery = { _id: id, isDeleted: false, createdBy: user.userId };

    if (req.method === 'GET') {
      const tenant = await Tenant.findOne(tenantQuery);
      if (!tenant) return sendError(res, 404, 'Tenant not found or not created by you');
      return res.status(200).json({ status: 'success', data: tenant });
    }

    if (req.method === 'PUT') {
      const updatedTenant = await Tenant.findOneAndUpdate(tenantQuery, req.body, { new: true });
      if (!updatedTenant) return sendError(res, 404, 'Tenant not found or not created by you');
      return res.status(200).json({ status: 'success', data: updatedTenant });
    }

    if (req.method === 'DELETE') {
      if (user.role !== 'SuperAdmin') return sendError(res, 403, 'Forbidden: only SuperAdmin can delete');
      const deletedTenant = await Tenant.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      return res.status(200).json({ status: 'success', message: 'Tenant soft deleted', data: deletedTenant });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error: any) {
    console.error('Tenant API error:', error);
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
}
