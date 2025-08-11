import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateTempPassword } from '@/lib/utils';
import nodemailer from 'nodemailer';
import Tenant from '@/models/Tenant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  if (req.method === 'GET') {
    const currentUser = verifyJwt(token);
    if (!currentUser || (currentUser.role !== 'SuperAdmin' && currentUser.role !== 'Admin')) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
    }

    try {
      const { page = 1, limit = 10, search = '', tenantId } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      const filter: any = { isDeleted: false };

      if (currentUser.role === 'SuperAdmin') {
        if (tenantId) {
          filter.tenantId = tenantId;
        }
      } else {
        if (!currentUser.tenantId) {
          return res.status(400).json({ status: 'error', message: 'tenantId is required for this user' });
        }
        filter.tenantId = currentUser.tenantId;
      }

      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [    
          { name: searchRegex },
          { email: searchRegex },
          { role: searchRegex }
        ];
      }

      const total = await User.countDocuments(filter);

      const users = await User.find(filter)
        .select('-password')
        .populate({
          path: 'tenantId',
          model: Tenant,
          select: '-__v -createdAt -updatedAt'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean();

      const transformedUsers = users.map(user => {
        const { tenantId, ...rest } = user;
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
          totalPages: Math.ceil(total / limitNumber)
        }
      });
    } catch (err: any) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const currentUser = verifyJwt(token);
    if (!currentUser || (currentUser.role !== 'SuperAdmin' && currentUser.role !== 'Admin')) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: insufficient permissions',
      });
    }

    const { name, email, role = 'OrgUser', tenantId } = req.body;

    if (!name || !email || !tenantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, email, tenantId',
      });
    }

    try {
      const existing = await User.findOne({
        email: email.trim().toLowerCase(),
        tenantId,
        isDeleted: false,
      });

      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: `User with this email already exists in tenant ${tenantId}`,
        });
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const expiresInHours = 24;
      const tempPasswordExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      const newUser = new User({
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        tenantId,
        isFirstLogin: true,
        tempPasswordExpiresAt,
        isDeleted: false,
        lastLogin: null,
        isActive: true,
      });

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        to: email,
        subject: 'Your Account Has Been Created',
        html: `
        <p>Hello ${name},</p>
        <p>Your account has been created.</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          <li><strong>Note:</strong> This password will expire in 24 hours.</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/login">Click here to login</a> and change your password.</p>
        <p>Thanks,<br/>Team</p>
      `,
      });

      await newUser.save();

      return res.status(201).json({
        status: 'success',
        message: 'User created and credentials emailed',
      });
    } catch (err: any) {
      console.error('Error creating user:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
      });
    }
  }

  if (req.method === 'PUT') {
    const currentUser = verifyJwt(token);
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    try {
      const userToUpdate = await User.findById(id);
      if (!userToUpdate || userToUpdate.isDeleted) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      const currentUserId = currentUser?.userId.toString();
      const targetUserId = userToUpdate._id.toString();

      if (currentUserId !== targetUserId && currentUser?.role !== 'SuperAdmin') {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You can only update your own profile or need SuperAdmin privileges'
        });
      }


      if (updateData.role) {
        if (currentUser?.role !== 'SuperAdmin') {
          return res.status(403).json({
            status: 'error',
            message: 'Forbidden: Only SuperAdmin can change user roles'
          });
        }

        if (userToUpdate.role === 'SuperAdmin' && updateData.role !== 'SuperAdmin') {
          return res.status(403).json({
            status: 'error',
            message: 'Forbidden: Cannot downgrade SuperAdmin role'
          });
        }
      }

      if (updateData.tenantId) {
        if (currentUser?.role !== 'SuperAdmin') {
          return res.status(403).json({
            status: 'error',
            message: 'Forbidden: Only SuperAdmin can change user tenants'
          });
        }
      }


      if (typeof updateData.isActive === 'boolean') {
        if (currentUserId !== targetUserId && currentUser?.role !== 'SuperAdmin') {
          return res.status(403).json({
            status: 'error',
            message: 'Forbidden: Only SuperAdmin can change other users\' active status',
          });
        }
      }

      const updateObject = {
        ...updateData,
        updatedAt: new Date()
      };
      console.log("🚀 ~ handler ~ updateObject:", updateObject)

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateObject },
        {
          new: true,
          runValidators: true
        }
      ).select('-password');

      return res.status(200).json({
        status: 'success',
        data: updatedUser,
        message: 'User updated successfully'
      });

    } catch (err: any) {
      console.error('Error updating user:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
      });
    }
  }

  if (req.method === 'DELETE') {
    const currentUser = verifyJwt(token);

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    try {
      const userToDelete = await User.findById(id);
      if (!userToDelete || userToDelete.isDeleted) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      if (currentUser?.userId !== id && currentUser?.role !== 'SuperAdmin') {
        return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
      }

      await User.findByIdAndUpdate(id, { isDeleted: true });

      return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (err: any) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
    }
  }

  return res.status(405).json({ status: 'error', message: 'Method not allowed' });
}
