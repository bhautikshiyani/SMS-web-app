import type { NextApiRequest, NextApiResponse } from 'next';
import Tenant from '@/models/Tenant';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';

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

    if (req.method === 'GET') {
      const { id, search = '', page = '1', limit = '10' } = req.query;
      if (id && !mongoose.Types.ObjectId.isValid(id as string)) {
        return sendError(res, 400, 'Invalid tenant ID format');
      }
      if (id) {
        const tenant = await Tenant.findOne({ _id: id, isDeleted: false });
        if (!tenant) return sendError(res, 404, 'Tenant not found');
        return res.status(200).json({ status: 'success', data: tenant });
      }

      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;

      const query: any = { isDeleted: false };

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const total = await Tenant.countDocuments(query);
      const tenants = await Tenant.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: 'success',
        data: tenants,
        meta: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return sendError(res, 401, 'No token provided');

    const user = verifyJwt(token);
    if (!user || user.role !== 'SuperAdmin') {
      return sendError(res, 403, 'Forbidden: insufficient permissions');
    }

    if (req.method === 'POST') {
      const { name, email, phone, address, featureToggles, retentionPeriodYears } = req.body;

      if (!name) {
        return sendError(res, 400, 'Missing required fields: name');
      }

      if (email) {
        const existingTenant = await Tenant.findOne({ email: email.trim().toLowerCase() });
        if (existingTenant) {
          return res.status(400).json({
            status: 'error',
            message: 'A tenant with this email already exists.'
          });
        }
      }

      const tenant = new Tenant({
        name,
        email: email?.trim().toLowerCase() || '',
        phone: phone || '',
        address: address || '',
        featureToggles: featureToggles || {
          messages: true,
          contacts: true,
          voicemail: true,
          phone: true,
        },
        retentionPeriodYears: retentionPeriodYears || 7,
        isDeleted: false,
      });

      await tenant.save();
      return res.status(201).json({ status: 'success', data: tenant });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
        return sendError(res, 400, 'Invalid tenant ID');
      }

      const updateData = req.body;
      const tenant = await Tenant.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      );

      if (!tenant) {
        return sendError(res, 404, 'Tenant not found');
      }

      return res.status(200).json({ status: 'success', data: tenant });
    }
    else if (req.method === 'DELETE') {
      if (!user || user.role !== 'SuperAdmin') {
        return sendError(res, 403, 'Forbidden: insufficient permissions');
      }

      const { id } = req.query; // or req.body, depending on your API

      if (!id) {
        return sendError(res, 400, 'Missing tenant ID');
      }

      try {
        const tenant = await Tenant.findByIdAndUpdate(
          id,
          { isDeleted: true },
          { new: true }
        );

        if (!tenant) {
          return sendError(res, 404, 'Tenant not found');
        }

        return res.status(200).json({
          status: 'success',
          message: 'Tenant soft deleted',
          data: tenant,
        });
      } catch (error) {
        console.error('Error deleting tenant:', error);
        return sendError(res, 500, 'Internal server error');
      }
    }
    return sendError(res, 405, 'Method not allowed');
  } catch (error: any) {
    console.error('API Error:', error);
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
}
