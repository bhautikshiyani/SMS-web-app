import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import ApiConfig from '@/models/ApiConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const currentUser = verifyJwt(token);
  if (!currentUser || currentUser.role !== 'SuperAdmin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
  }

  try {
    if (req.method === 'GET') {
      const config = await ApiConfig.findOne({ lastUpdatedBy: currentUser.userId }).sort({ lastUpdatedAt: -1 });

      if (!config) {
        return res.status(200).json({
          status: 'success',
          data: {
            apiKey: null,
            apiSecret: null,
            lastUpdatedBy: currentUser.userId,
            lastUpdatedAt: null,
            _id: null,
          },
          message: 'No API configuration found for this user'
        });
      }

      const { apiSecret, ...safeConfig } = config.toObject();
      return res.status(200).json({ status: 'success', data: safeConfig });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { apiKey, apiSecret } = req.body;

      if (!apiKey || !apiSecret) {
        return res.status(400).json({ status: 'error', message: 'Both apiKey and apiSecret are required' });
      }

      const newConfig = new ApiConfig({
        apiKey,
        apiSecret,
        lastUpdatedBy: currentUser.userId
      });

      await newConfig.save();

      const { apiSecret: _, ...safeConfig } = newConfig.toObject();

      return res.status(200).json({ status: 'success', data: safeConfig, message: 'API configuration saved successfully' });
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Config Error:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
}
