import type { NextApiRequest, NextApiResponse } from 'next';
import { saveApiKey } from '@/lib/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { apiKey } = req.body;
  const userId = 'default'; 
  saveApiKey(userId, apiKey);
  res.status(200).json({ success: true });
}
