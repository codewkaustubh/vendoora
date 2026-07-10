import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vendoora-super-secret-key-123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CLIENT' | 'VENDOR' | 'ADMIN';
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        return;
      }

      req.user = user as { id: string; email: string; role: 'CLIENT' | 'VENDOR' | 'ADMIN' };
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
}

export function requireRole(roles: ('CLIENT' | 'VENDOR' | 'ADMIN')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }

    next();
  };
}
