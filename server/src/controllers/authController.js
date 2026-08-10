"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getMe = exports.login = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const auth_1 = require("../middleware/auth");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email and password are required' } });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        }
        const secret = process.env.JWT_SECRET || 'fundsroom_secret_jwt_key_2026';
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, secret, { expiresIn: '24h' });
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        return res.json({ user });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getMe = getMe;
const getUsers = async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        return res.json({ users });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=authController.js.map