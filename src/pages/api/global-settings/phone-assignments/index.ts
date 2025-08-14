import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import PhoneAssignment from '@/models/PhoneAssignment';
import User from '@/models/User';
import Group from '@/models/Group';
import Tenant from '@/models/Tenant';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const currentUser: any = verifyJwt(token);
  if (!currentUser || currentUser.role !== 'SuperAdmin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
  }

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search = '', tenantId, assignedToType } = req.query;

      const filter: any = {
        assignedById: currentUser.userId,
        isDeleted: false,

      };

      if (search) {
        filter.phoneNumber = { $regex: search, $options: 'i' };
      }

      if (tenantId) {
        filter.tenantId = tenantId;
      }

      if (assignedToType) {
        filter.assignedToType = assignedToType;
      }

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      const total = await PhoneAssignment.countDocuments(filter);

      const assignments = await PhoneAssignment.find(filter)
        .populate('tenantId', 'name')
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean();

      const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
        let assignedTo = null;

        if (assignment.assignedToType === 'user') {
          const user = await User.findById(assignment.assignedToId)
            .select('name email role phoneNumber')
            .lean();
          assignedTo = user;
        } else {
          const group = await Group.findById(assignment.assignedToId)
            .select('name description phoneNumber')
            .lean();
          assignedTo = group;
        }

        return {
          ...assignment,
          assignedTo,
          tenant: assignment.tenantId,
          tenantId: assignment.tenantId?._id
        };
      }));

      return res.status(200).json({
        status: 'success',
        data: enrichedAssignments,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      });
    }

    if (req.method === 'POST') {
      const { phoneNumber, tenantId, assignedToType, assignedToId } = req.body;

      if (!phoneNumber || !tenantId || !assignedToType || !assignedToId) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: phoneNumber, tenantId, assignedToType, assignedToId'
        });
      }

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({
          status: 'error',
          message: 'Tenant not found'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let assignedEntity;

        if (assignedToType === 'user') {
          assignedEntity = await User.findOne({
            _id: assignedToId,
            tenantId,
            isDeleted: false
          }).session(session);

          if (!assignedEntity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
              status: 'error',
              message: 'User not found in this tenant'
            });
          }
        } else {
          assignedEntity = await Group.findOne({
            _id: assignedToId,
            tenantId,
            isDeleted: false
          }).session(session);

          if (!assignedEntity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
              status: 'error',
              message: 'Group not found in this tenant'
            });
          }
        }

        const existingAssignmentForEntity = await PhoneAssignment.findOne({
          assignedToType,
          assignedToId
        }).session(session);

        if (existingAssignmentForEntity) {
          // If updating to a new number, make sure the new number isn't already assigned to another entity
          const existingNumberAssignment = await PhoneAssignment.findOne({
            phoneNumber,
            _id: { $ne: existingAssignmentForEntity._id }
          }).session(session);

          if (existingNumberAssignment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
              status: 'error',
              message: 'This phone number is already assigned to another entity'
            });
          }

          // Update existing assignment
          existingAssignmentForEntity.phoneNumber = phoneNumber;
          await existingAssignmentForEntity.save({ session });

          // Also update phone number in user/group document
          assignedEntity.phoneNumber = phoneNumber;
          await assignedEntity.save({ session });

          await session.commitTransaction();
          session.endSession();
          return res.status(200).json({
            status: 'success',
            data: existingAssignmentForEntity,
            message: 'Phone number updated successfully'
          });
        }

        const existingNumberAssignment = await PhoneAssignment.findOne({
          phoneNumber
        }).session(session);

        if (existingNumberAssignment) {
          await session.abortTransaction();
          session.endSession();
          return res.status(409).json({
            status: 'error',
            message: 'This phone number is already assigned to another entity'
          });
        }

        const newAssignment = new PhoneAssignment({
          phoneNumber,
          tenantId,
          assignedToType,
          assignedToId,
          assignedByName: currentUser.name,
          assignedById: currentUser.userId
        });

        await newAssignment.save({ session });

        assignedEntity.phoneNumber = phoneNumber;
        await assignedEntity.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
          status: 'success',
          data: newAssignment,
          message: 'Phone number assigned successfully'
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { isActive } = req.body;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Assignment ID is required'
        });
      }

      const assignment = await PhoneAssignment.findById(id);
      if (!assignment) {
        return res.status(404).json({
          status: 'error',
          message: 'Assignment not found'
        });
      }
      if (assignment.assignedById.toString() !== currentUser.userId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: not your assignment' });
      }



      if (typeof isActive === 'boolean') {
        assignment.isActive = isActive;
        await assignment.save();
      }

      return res.status(200).json({
        status: 'success',
        data: assignment,
        message: 'Assignment updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Assignment ID is required'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const assignment = await PhoneAssignment.findById(id).session(session);
        if (!assignment) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            status: 'error',
            message: 'Assignment not found'
          });
        }
        if (assignment.assignedById.toString() !== currentUser.userId) {
          return res.status(403).json({ status: 'error', message: 'Forbidden: not your assignment' });
        }

        if (assignment.assignedToType === 'user') {
          await User.findByIdAndUpdate(
            assignment.assignedToId,
            { $unset: { phoneNumber: 1 } },
            { session }
          );
        } else {
          await Group.findByIdAndUpdate(
            assignment.assignedToId,
            { $unset: { phoneNumber: 1 } },
            { session }
          );
        }

        await PhoneAssignment.findByIdAndDelete(id).session(session);
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          status: 'success',
          message: 'Assignment deleted successfully'
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Phone Assignment Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
}