import type { NextApiRequest, NextApiResponse } from 'next';
import Tenant from '@/models/Tenant';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

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

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return sendError(res, 401, 'No token provided');

        const user = verifyJwt(token);
        if (!user || user.role !== 'SuperAdmin') {
            return sendError(res, 403, 'Forbidden: insufficient permissions');
        }

        if (req.method === 'GET') {
            const tenants = await Tenant.find({});
            return res.status(200).json({ status: 'success', data: tenants });
        }
        else if (req.method === 'POST') {
            console.log('Creating new tenant with body:', req.body);
            const { name, logoUrl, sinchApiKey, sinchApiSecret, featureToggles, retentionPeriodYears } = req.body;

            if (!name || !sinchApiKey || !sinchApiSecret) {
                return sendError(res, 400, 'Missing required fields: name, sinchApiKey, sinchApiSecret');
            }

            const tenant = new Tenant({
                name,
                logoUrl: logoUrl || '',
                sinchApiKey,
                sinchApiSecret,
                featureToggles: featureToggles || {
                    messages: true,
                    contacts: true,
                    voicemail: true,
                    phone: true,
                },
                retentionPeriodYears: retentionPeriodYears || 7,
            });

            await tenant.save();
            return res.status(201).json({ status: 'success', data: tenant });
        }
        else {
            return sendError(res, 405, 'Method not allowed');
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return sendError(res, 500, error.message || 'Internal Server Error');
    }
}
