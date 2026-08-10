import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication token required' } });
  }

  const secret = process.env.JWT_SECRET || 'fundsroom_secret_jwt_key_2026';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
    }
    req.user = user as AuthRequest['user'];
    next();
  });
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: `Access denied. Role '${req.user.role}' is not authorized for this endpoint.` 
        } 
      });
    }

    next();
  };
};
