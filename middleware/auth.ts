import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserSession } from './types';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'] as string;

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET_KEY) as UserSession;

    req.user= {
      email: decoded.email,
      name: decoded.user_metadata.full_name,
      userId: decoded.user_metadata.sub
    };

    next();
  // eslint-disable-next-line no-unused-vars
  } catch (e){
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
};