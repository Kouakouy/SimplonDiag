"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id, email: payload.email, role: payload.role };
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const role = req.user.role || 'creator';
        if (!roles.includes(role))
            return res.status(403).json({ message: 'Forbidden' });
        next();
    };
};
exports.requireRole = requireRole;
