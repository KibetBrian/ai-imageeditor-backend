import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

interface SupabaseJWT {
  sub: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  app_metadata?: {
    provider?: string;
  };
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid authorization header format. Use: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as SupabaseJWT;

    if (!decoded.sub) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token structure' });
    }

    req.user = {
      userId: decoded.sub,
      email: decoded.email || '',
      name: decoded.user_metadata?.full_name || decoded.user_metadata?.name || ''
    };

    next();
  } catch (e) {
    const error = e as Error;
    
    let message = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token signature';
    }

    return res.status(StatusCodes.UNAUTHORIZED).json({ message });
  }
};