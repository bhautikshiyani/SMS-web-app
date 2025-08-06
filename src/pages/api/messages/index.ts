import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import Tenant from '@/models/Tenant';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  let userPayload: any;
  try {
    userPayload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const { tenantId } = req.query;
  if (!tenantId || typeof tenantId !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid tenantId' });
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  try {
    const response = await axios.get(
      `https://sms.api.sinch.com/xms/v1/${tenant.sinchApiKey}/batches`,
      {
        auth: {
          username: tenant.sinchApiKey,
          password: tenant.sinchApiSecret,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({
      status: 'success',
      data: response.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Failed to fetch messages',
      error: error.response?.data || error.message,
    });
  }
}
