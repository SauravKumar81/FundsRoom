"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateToken = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication token required' } });
    }
    const secret = process.env.JWT_SECRET || 'fundsroom_secret_jwt_key_2026';
    jsonwebtoken_1.default.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const requireRoles = (roles) => {
    return (req, res, next) => {
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
exports.requireRoles = requireRoles;
//# sourceMappingURL=auth.js.map