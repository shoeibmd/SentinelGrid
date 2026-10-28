import { db } from '../db/index.js';
import { User, UserRole } from '../models/types.js';
import { comparePassword, generateToken, hashPassword } from '../utils/crypto.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  static async login(username: string, passwordPlain: string, ipAddress: string): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const user = Array.from(db.users.values()).find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      db.addAuditLog(
        undefined,
        username,
        'AUTH_LOGIN_FAILED',
        'USER',
        undefined,
        { reason: 'User not found' },
        ipAddress
      );
      throw new Error('Invalid credentials.');
    }

    const isMatch = await comparePassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      db.addAuditLog(
        user.id,
        user.username,
        'AUTH_LOGIN_FAILED',
        'USER',
        user.id,
        { reason: 'Invalid password' },
        ipAddress
      );
      throw new Error('Invalid credentials.');
    }

    user.lastLogin = new Date().toISOString();
    const token = generateToken(user);

    db.addAuditLog(
      user.id,
      user.username,
      'AUTH_LOGIN_SUCCESS',
      'USER',
      user.id,
      { role: user.role },
      ipAddress
    );

    const { passwordHash, ...userClean } = user;
    return { token, user: userClean };
  }

  static async registerUser(
    username: string,
    email: string,
    passwordPlain: string,
    role: UserRole,
    creatorUsername: string,
    ipAddress: string
  ): Promise<Omit<User, 'passwordHash'>> {
    const existing = Array.from(db.users.values()).find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      throw new Error('Username or email already exists.');
    }

    const passwordHash = await hashPassword(passwordPlain);
    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      passwordHash,
      role,
      mfaEnabled: false,
      createdAt: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);

    db.addAuditLog(
      newUser.id,
      creatorUsername,
      'USER_CREATED',
      'USER',
      newUser.id,
      { createdUsername: username, role },
      ipAddress
    );

    const { passwordHash: _, ...clean } = newUser;
    return clean;
  }

  static getUserById(id: string): Omit<User, 'passwordHash'> | null {
    const user = db.users.get(id);
    if (!user) return null;
    const { passwordHash, ...clean } = user;
    return clean;
  }
}
