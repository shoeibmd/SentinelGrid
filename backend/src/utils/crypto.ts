import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sentinelgrid-super-secret-key-change-in-prod-2026';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as any;

export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 12);
}

export function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateToken(user: Omit<User, 'passwordHash'>): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function computeSha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function calculateAuditHash(previousHash: string, entryData: object): string {
  const payload = previousHash + ':' + JSON.stringify(entryData);
  return computeSha256(payload);
}
