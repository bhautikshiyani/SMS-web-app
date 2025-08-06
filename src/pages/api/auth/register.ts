import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import Tenant from '@/models/Tenant';  

const allowedRoles = ['SuperAdmin', 'Admin', 'OrgManager', 'OrgUser'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { name, email, password, tenantId, phone, avatar, role } = req.body;
    console.log('Registering user with body:', req.body);   
  if (!name || !email || !password || !tenantId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  await dbConnect();

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(409).json({ message: 'User already exists' });

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const finalRole = allowedRoles.includes(role) ? role : 'OrgUser';

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: finalRole,
    tenantId: tenantId,  
    phone,
    avatar,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      tenantId,  
    },
  });
}
