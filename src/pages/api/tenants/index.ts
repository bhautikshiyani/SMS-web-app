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

    const authHeader = req.headers.authorization;
    if (!authHeader) return sendError(res, 401, 'No token provided');

    const token = authHeader.split(' ')[1];
    const user = verifyJwt(token);
    if (!user) return sendError(res, 401, 'Invalid token');

    if (user.role !== 'SuperAdmin') {
      return sendError(res, 403, 'Forbidden: only SuperAdmin can access');
    }

    if (req.method === 'GET') {
      const { search = '', page = '1', limit = '10' } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;

      const query: any = {
        isDeleted: false,
        createdBy: user.userId, 
      };

      if (search) query.name = { $regex: search, $options: 'i' };

      const total = await Tenant.countDocuments(query);
      const tenants = await Tenant.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: 'success',
        data: tenants,
        meta: { total, page: pageNumber, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
      });
    }

    if (req.method === 'POST') {
      const { name, email, phone, address, featureToggles, retentionPeriodYears } = req.body;
      if (!name) return sendError(res, 400, 'Missing required field: name');

      if (email) {
        const existing = await Tenant.findOne({ email: email.trim().toLowerCase() });
        if (existing) return sendError(res, 400, 'Tenant with this email already exists');
      }
      const tenant = new Tenant({
        name,
        email: email?.trim().toLowerCase() || '',
        phone: phone || '',
        address: address || '',
        featureToggles: featureToggles || { messages: true, contacts: true, voicemail: true, phone: true },
        retentionPeriodYears: retentionPeriodYears || 7,
        isDeleted: false,
        createdBy: user.userId, 
      });
      await tenant.save();
      return res.status(201).json({ status: 'success', data: tenant });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error: any) {
    console.error('Tenant API error:', error);
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
}
