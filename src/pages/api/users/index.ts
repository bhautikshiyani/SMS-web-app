import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateTempPassword } from '@/lib/utils';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const user = verifyJwt(token);
  if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Admin')) {
    return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient permissions' });
  }

  const { name, email, role = 'OrgUser', tenantId } = req.body;

  if (!name || !email || !tenantId) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields: name, email, tenantId' });
  }

  try {
    const existing = await User.findOne({ email, isDeleted: false });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'User with this email already exists' });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const expiresInHours = 24;
    const tempPasswordExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      tenantId,
      isFirstLogin: true,
      tempPasswordExpiresAt,
      isDeleted: false,
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

    return res.status(201).json({ status: 'success', message: 'User created and credentials emailed' });

  } catch (err: any) {
    console.error('Error creating user:', err);
    return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  }
}
