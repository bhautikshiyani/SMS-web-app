import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import Group from '@/models/Group';
import mongoose from 'mongoose';
import Tenant from '@/models/Tenant';

function sendError(res: NextApiResponse, statusCode: number, message: string) {
    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return sendError(res, 401, 'No token provided');

    const currentUser = verifyJwt(token);
    if (!currentUser || (currentUser.role !== 'SuperAdmin' && currentUser.role !== 'Admin')) {
        return sendError(res, 403, 'Forbidden: insufficient permissions');
    }

    try {
        if (req.method === 'GET') {
            const { page = 1, limit = 10, search = '', tenantId } = req.query;

            const filter: any = { isDeleted: false };


            if (currentUser.role === 'SuperAdmin') {
                if (tenantId) {
                    filter.tenantId = tenantId;
                }
            } else {
                if (!currentUser.tenantId) {
                    return sendError(res, 400, 'tenantId is required for this user');
                }
                filter.tenantId = currentUser.tenantId;
            }

            if (search) {
                const regex = new RegExp(search as string, 'i');
                filter.name = regex;
            }

            const pageNumber = parseInt(page as string, 10);
            const limitNumber = parseInt(limit as string, 10);
            const skip = (pageNumber - 1) * limitNumber;

            const total = await Group.countDocuments(filter);
            const groups = await Group.find(filter)
                .populate('users', '-password -isDeleted')
                .populate({
                    path: 'tenantId',
                    model: Tenant,
                    select: '-__v -createdAt -updatedAt',
                })

                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 })
                .lean();

            const transformedUsers = groups.map(group => {
                const { tenantId, ...rest } = group;
                return {
                    ...rest,
                    tenant: tenantId,
                    tenantId: tenantId?._id || null,
                };
            });

            return res.status(200).json({
                status: 'success',
                data: transformedUsers,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                },
            });
        }

        if (req.method === 'POST') {
            const { name, description, phoneNumber, users = [], tenantId } = req.body;

            const effectiveTenantId =
                currentUser.role === 'SuperAdmin'
                    ? tenantId
                    : currentUser.tenantId;

            if (!name || !effectiveTenantId) {
                return sendError(res, 400, 'Missing required fields: name, tenantId');
            }

            const existingGroup = await Group.findOne({
                name: name.trim(),
                tenantId: effectiveTenantId,
                isDeleted: false,
            });
            if (existingGroup) {
                return sendError(res, 409, 'Group with this name already exists in this tenant');
            }

            const group = new Group({
                name: name.trim(),
                description: description || '',
                phoneNumber: phoneNumber || '',
                users: users.map((id: string) => new mongoose.Types.ObjectId(id)),
                tenantId: effectiveTenantId,
            });

            await group.save();

            return res.status(201).json({
                status: 'success',
                message: 'Group created successfully',
                data: group,
            });
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
                return sendError(res, 400, 'Invalid group ID');
            }

            const updateData = req.body;

            const group = await Group.findOne({ _id: id, isDeleted: false });
            if (!group) {
                return sendError(res, 404, 'Group not found');
            }

            if (
                currentUser.role !== 'SuperAdmin' &&
                group.tenantId.toString() !== currentUser.tenantId
            ) {
                return sendError(res, 403, 'Forbidden: insufficient permissions');
            }

            if (updateData.name) {
                if (updateData.name.trim() !== group.name) {
                    const existingGroup = await Group.findOne({
                        name: updateData.name.trim(),
                        tenantId: group.tenantId,
                        isDeleted: false,
                        _id: { $ne: group._id },
                    });
                    if (existingGroup) {
                        return sendError(res, 409, 'Group with this name already exists in this tenant');
                    }
                }
                group.name = updateData.name.trim();
            }
            if (typeof updateData.description === 'string') {
                group.description = updateData.description;
            }
            if (typeof updateData.phoneNumber === 'string') {
                group.phoneNumber = updateData.phoneNumber;
            }
            if (Array.isArray(updateData.users)) {
                group.users = updateData.users.map((id: string) => new mongoose.Types.ObjectId(id));
            }
            if (typeof updateData.isActive === 'boolean') {
                group.isActive = updateData.isActive;
            }

            await group.save();

            return res.status(200).json({
                status: 'success',
                message: 'Group updated successfully',
                data: group,
            });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
                return sendError(res, 400, 'Invalid group ID');
            }   

            const group = await Group.findOne({ _id: id, isDeleted: false });
            if (!group) {
                return sendError(res, 404, 'Group not found');
            }

            if (
                currentUser.role !== 'SuperAdmin' &&
                group.tenantId.toString() !== currentUser.tenantId
            ) {
                return sendError(res, 403, 'Forbidden: insufficient permissions');
            }

            group.isDeleted = true;
            await group.save();

            return res.status(200).json({
                status: 'success',
                message: 'Group deleted successfully',
            });
        }

        return sendError(res, 405, 'Method not allowed');
    } catch (error: any) {
        console.error('Group API Error:', error);
        return sendError(res, 500, error.message || 'Internal Server Error');
    }
}
