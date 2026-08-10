"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollowUpNote = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const auth_1 = require("../middleware/auth");
const getCustomers = async (req, res) => {
    try {
        const { search, status, customerType, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (customerType) {
            where.customerType = customerType;
        }
        if (search) {
            const query = search;
            where.OR = [
                { name: { contains: query } },
                { email: { contains: query } },
                { mobile: { contains: query } },
                { businessName: { contains: query } },
                { gstNumber: { contains: query } }
            ];
        }
        const [customers, total] = await Promise.all([
            prisma_1.prisma.customer.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: {
                        select: { followUps: true, challans: true }
                    }
                }
            }),
            prisma_1.prisma.customer.count({ where })
        ]);
        return res.json({
            customers,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await prisma_1.prisma.customer.findUnique({
            where: { id },
            include: {
                followUps: {
                    orderBy: { createdAt: 'desc' }
                },
                challans: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!customer) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
        }
        return res.json({ customer });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res) => {
    try {
        const { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;
        if (!name || !mobile || !email || !businessName || !customerType || !address) {
            return res.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Missing required customer fields (name, mobile, email, businessName, customerType, address)'
                }
            });
        }
        const customer = await prisma_1.prisma.customer.create({
            data: {
                name,
                mobile,
                email,
                businessName,
                gstNumber: gstNumber || null,
                customerType,
                address,
                status: status || 'Active',
                followUpDate: followUpDate || null,
                notes: notes || null
            }
        });
        if (notes) {
            await prisma_1.prisma.customerFollowUp.create({
                data: {
                    customerId: customer.id,
                    note: notes,
                    followUpDate: followUpDate || null,
                    createdBy: req.user?.name || 'System'
                }
            });
        }
        return res.status(201).json({ customer });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;
        const existing = await prisma_1.prisma.customer.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
        }
        const updated = await prisma_1.prisma.customer.update({
            where: { id },
            data: {
                name,
                mobile,
                email,
                businessName,
                gstNumber: gstNumber !== undefined ? gstNumber : existing.gstNumber,
                customerType,
                address,
                status,
                followUpDate,
                notes
            }
        });
        return res.json({ customer: updated });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.updateCustomer = updateCustomer;
const addFollowUpNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, followUpDate } = req.body;
        if (!note) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Note text is required' } });
        }
        const customer = await prisma_1.prisma.customer.findUnique({ where: { id } });
        if (!customer) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
        }
        const [followUpNote] = await Promise.all([
            prisma_1.prisma.customerFollowUp.create({
                data: {
                    customerId: id,
                    note,
                    followUpDate: followUpDate || null,
                    createdBy: req.user?.name || 'System'
                }
            }),
            prisma_1.prisma.customer.update({
                where: { id },
                data: {
                    followUpDate: followUpDate || customer.followUpDate,
                    notes: note
                }
            })
        ]);
        return res.status(201).json({ followUpNote });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.addFollowUpNote = addFollowUpNote;
//# sourceMappingURL=customerController.js.map