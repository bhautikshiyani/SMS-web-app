import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import ApiConfig from '@/models/ApiConfig';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Check token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const currentUser = verifyJwt(token);
  if (!currentUser || currentUser.role !== 'SuperAdmin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (req.method === 'GET') {
      const config = await ApiConfig.findOne({ userId: id }).sort({ lastUpdatedAt: -1 });

      if (!config) {
        return res.status(200).json({
          status: 'success',
          data: {
            apiKey: null,
            apiSecret: null,
            lastUpdatedBy: null,
            lastUpdatedAt: null,
            _id: null,
            userId: id
          },
          message: 'No API configuration found for this user'
        });
      }

      const configObj = config.toObject();
      console.log('API Config:', configObj);

      return res.status(200).json({
        status: 'success',
        data: configObj
      });
    }

    if (req.method === 'PUT') {
      const { apiKey, apiSecret } = req.body;

      if (!apiKey && !apiSecret) {
        return res.status(400).json({
          status: 'error',
          message: 'Either apiKey or apiSecret is required for update'
        });
      }

      const now = new Date();

      const configExists = await ApiConfig.exists({ userId: id });

      const config = await ApiConfig.findOneAndUpdate(
        { userId: id },
        {
          ...(apiKey !== undefined && { apiKey }),
          ...(apiSecret !== undefined && { apiSecret }),
          lastUpdatedBy: currentUser.userId,
          updatedAt: now,
          ...(configExists ? {} : { createdAt: now, userId: id })
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const configObj = config.toObject();

      return res.status(200).json({
        status: 'success',
        data:configObj,
        message: configExists
          ? 'API configuration updated successfully'
          : 'API configuration created successfully'
      });
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Config Error:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
}
