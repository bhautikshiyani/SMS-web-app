import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSMS } from '@/lib/sinch';
import { getApiKey } from '@/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { to, message } = req.body;
  const userId = 'default';
  const apiKey = getApiKey(userId);

  if (!apiKey) return res.status(400).json({ error: 'API key not found' });

  try {
    const result = await sendSMS(to, message, apiKey);
    res.status(200).json({ messageId: result?.id || null });
  } catch (err) {
    console.log(err,"err")
    res.status(500).json({ error: 'Failed to send SMS' });
  }
}
