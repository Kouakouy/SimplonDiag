import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role?: 'admin'|'observer'|'creator' }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any
    req.user = { id: payload.id, email: payload.email, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireRole = (roles: Array<'admin'|'observer'|'creator'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const role = req.user.role || 'creator'
    if (!roles.includes(role)) return res.status(403).json({ message: 'Forbidden' })
    next()
  }
}


