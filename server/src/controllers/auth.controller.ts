import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createUser, findUserByEmail, findUserById } from '../services/users.service';
import { signToken } from '../utils/jwt';
import { ApiError } from '../middleware/errorHandler';
import { User } from '../types';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  storeName: z.string().trim().min(1, 'Store name is required.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toSafeUser(user: User) {
  return { id: user.id, email: user.email, storeName: user.storeName, createdAt: user.createdAt };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, storeName } = registerSchema.parse(req.body);

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash, storeName });
    const token = signToken({ sub: user.id, email: user.email });

    res.status(201).json({ token, user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findUserById(req.user!.sub);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    res.json({ user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
}
