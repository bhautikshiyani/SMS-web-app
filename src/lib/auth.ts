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
export interface DecodedToken {
  role?: string;
  exp?: number;
  [key: string]: unknown; // Use 'unknown' instead of 'any'
}

export const parseJwt = (authToken: string): DecodedToken | null => {
  try {
    const base64Url = authToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    const parsed = JSON.parse(jsonPayload);

    // Optionally narrow the type here
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as DecodedToken;
    }

    return null;
  } catch (e) {
    console.log('🚀 ~ e:', e);
    return null;
  }
};
