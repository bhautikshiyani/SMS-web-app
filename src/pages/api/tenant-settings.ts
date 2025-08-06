import type { NextApiRequest, NextApiResponse } from 'next';
import Tenant from '@/models/Tenant';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

function sendError(res: NextApiResponse, statusCode: number, message: string) {
  return res.status(statusCode).json({ status: 'error', statusCode, message });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    const authHeader = req.headers.authorization;
    if (!authHeader) return sendError(res, 401, 'No authorization header provided');

    const token = authHeader.split(' ')[1];
    if (!token) return sendError(res, 401, 'No token provided');

    const user = verifyJwt(token);
    if (!user) return sendError(res, 401, 'Invalid token');

    const tenantId = user.tenantId;
    if (!tenantId) return sendError(res, 400, 'Tenant ID missing in token');

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return sendError(res, 404, 'Tenant not found');

    if (req.method === 'GET') {
      return res.status(200).json({ status: 'success', apiKey: tenant.sinchApiKey || '' });
    }

    if (req.method === 'PUT') {
      const { apiKey } = req.body;
      if (!apiKey) return sendError(res, 400, 'API Key is required');

      tenant.sinchApiKey = apiKey;
      await tenant.save();

      return res.status(200).json({ status: 'success', message: 'API Key updated successfully' });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error: any) {
    console.error('API Error:', error);
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
}
