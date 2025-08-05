import jwt from 'jsonwebtoken';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export function verifyJwt(token: string): JwtUserPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') return null;

    return decoded as JwtUserPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
