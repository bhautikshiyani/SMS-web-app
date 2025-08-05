import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import Tenant from '@/models/Tenant';
import jwt from 'jsonwebtoken';
import axios from 'axios';

interface SinchSMSResponse {
  id: string;
  to: { type: string; number: string }[];
  from: string;
  body: string;
  type: string;
  delivery_report: string;
  created_at: string;
  modified_at: string;
  client_reference?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  let userPayload: any;
  console.log("🚀 ~ handler ~ userPayload:", userPayload)
  try {
    userPayload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const { to, from, message, tenantId } = req.body;
  if (!to || !from || !message || !tenantId) {
    return res.status(400).json({ message: 'Missing fields: to, from, message, tenantId' });
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  try {
    const response = await axios.post<SinchSMSResponse>(
      `https://sms.api.sinch.com/xms/v1/${tenant.sinchApiKey}/batches`,
      {
        from,
        to: [to],
        body: message,
      },
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
      messageId: response.data.id,
      status: 'Sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'SMS sending failed',
      error: error.response?.data || error.message,
    });
  }
}
