import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET in server/.env');
  }
  return secret;
}

export function signToken(payload: AuthTokenPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
}
