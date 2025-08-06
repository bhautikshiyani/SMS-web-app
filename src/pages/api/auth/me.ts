import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import {dbConnect} from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await dbConnect();

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
