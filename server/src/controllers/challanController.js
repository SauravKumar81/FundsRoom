"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanStatus = exports.createChallan = exports.getChallanById = exports.getChallans = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const auth_1 = require("../middleware/auth");
const generateChallanNumber = async () => {
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const count = await prisma_1.prisma.salesChallan.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `CH-${dateStr}-${nextNum}`;
};
const getChallans = async (req, res) => {
    try {
        const { status, customerId, search, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (customerId) {
            where.customerId = customerId;
        }
        if (search) {
            const query = search;
            where.OR = [
                { challanNumber: { contains: query } },
                { customerName: { contains: query } }
            ];
        }
        const [challans, total] = await Promise.all([
            prisma_1.prisma.salesChallan.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true
                }
            }),
            prisma_1.prisma.salesChallan.count({ where })
        ]);
        return res.json({
            challans,
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
exports.getChallans = getChallans;
const getChallanById = async (req, res) => {
    try {
        const { id } = req.params;
        const challan = await prisma_1.prisma.salesChallan.findUnique({
            where: { id },
            include: {
                customer: true,
                items: true
            }
        });
        if (!challan) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Challan not found' } });
        }
        return res.json({ challan });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getChallanById = getChallanById;
const createChallan = async (req, res) => {
    try {
        const { customerId, items, status = 'Draft' } = req.body;
        if (!customerId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Customer ID and at least one line item are required'
                }
            });
        }
        const customer = await prisma_1.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
        }
        // Validate line items & product availability
        const productIds = items.map((i) => i.productId);
        const products = await prisma_1.prisma.product.findMany({
            where: { id: { in: productIds } }
        });
        const productMap = new Map(products.map(p => [p.id, p]));
        let totalQuantity = 0;
        let totalAmount = 0;
        const preparedItems = [];
        for (const item of items) {
            const prod = productMap.get(item.productId);
            if (!prod) {
                return res.status(404).json({
                    error: { code: 'PRODUCT_NOT_FOUND', message: `Product ID '${item.productId}' not found` }
                });
            }
            const qty = parseInt(item.quantity, 10);
            if (!qty || qty <= 0) {
                return res.status(400).json({
                    error: { code: 'INVALID_QUANTITY', message: `Invalid quantity for product '${prod.name}'` }
                });
            }
            // Check stock if status is Confirmed
            if (status === 'Confirmed' && prod.currentStock < qty) {
                return res.status(400).json({
                    error: {
                        code: 'INSUFFICIENT_STOCK',
                        message: `Insufficient stock for '${prod.name}' (SKU: ${prod.sku}). Required: ${qty}, Available: ${prod.currentStock}`
                    }
                });
            }
            const itemUnitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : prod.unitPrice;
            preparedItems.push({
                productId: prod.id,
                productName: prod.name,
                productSku: prod.sku,
                unitPrice: itemUnitPrice,
                quantity: qty
            });
            totalQuantity += qty;
            totalAmount += itemUnitPrice * qty;
        }
        const challanNumber = await generateChallanNumber();
        // Use transaction to create challan and update stock if Confirmed
        const newChallan = await prisma_1.prisma.$transaction(async (tx) => {
            const created = await tx.salesChallan.create({
                data: {
                    challanNumber,
                    customerId: customer.id,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerMobile: customer.mobile,
                    totalQuantity,
                    totalAmount,
                    status,
                    createdBy: req.user?.name || 'Sales User',
                    items: {
                        create: preparedItems
                    }
                },
                include: {
                    items: true
                }
            });
            if (status === 'Confirmed') {
                for (const item of preparedItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { decrement: item.quantity } }
                    });
                    await tx.stockMovementLog.create({
                        data: {
                            productId: item.productId,
                            quantityChanged: item.quantity,
                            movementType: 'OUT',
                            reason: `Sales Challan ${created.challanNumber} Confirmed`,
                            createdBy: req.user?.name || 'Sales User'
                        }
                    });
                }
            }
            return created;
        });
        return res.status(201).json({ challan: newChallan });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.createChallan = createChallan;
const updateChallanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['Confirmed', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                error: { code: 'BAD_REQUEST', message: 'Status can only be updated to Confirmed or Cancelled' }
            });
        }
        const challan = await prisma_1.prisma.salesChallan.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!challan) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Challan not found' } });
        }
        if (challan.status === status) {
            return res.status(400).json({
                error: { code: 'NO_CHANGE', message: `Challan is already in '${status}' status` }
            });
        }
        if (challan.status === 'Cancelled') {
            return res.status(400).json({
                error: { code: 'INVALID_TRANSITION', message: 'Cannot modify a Cancelled challan' }
            });
        }
        // Handle Transition to Confirmed from Draft
        if (status === 'Confirmed' && challan.status === 'Draft') {
            // Check current stock for all items first
            const productIds = challan.items.map(i => i.productId);
            const products = await prisma_1.prisma.product.findMany({
                where: { id: { in: productIds } }
            });
            const productMap = new Map(products.map(p => [p.id, p]));
            for (const item of challan.items) {
                const prod = productMap.get(item.productId);
                if (!prod) {
                    return res.status(404).json({
                        error: { code: 'PRODUCT_NOT_FOUND', message: `Product '${item.productName}' no longer exists` }
                    });
                }
                if (prod.currentStock < item.quantity) {
                    return res.status(400).json({
                        error: {
                            code: 'INSUFFICIENT_STOCK',
                            message: `Insufficient stock for '${prod.name}' (SKU: ${prod.sku}). Required: ${item.quantity}, Available: ${prod.currentStock}`
                        }
                    });
                }
            }
            const updatedChallan = await prisma_1.prisma.$transaction(async (tx) => {
                for (const item of challan.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { decrement: item.quantity } }
                    });
                    await tx.stockMovementLog.create({
                        data: {
                            productId: item.productId,
                            quantityChanged: item.quantity,
                            movementType: 'OUT',
                            reason: `Sales Challan ${challan.challanNumber} Confirmed`,
                            createdBy: req.user?.name || 'System'
                        }
                    });
                }
                return tx.salesChallan.update({
                    where: { id },
                    data: { status: 'Confirmed' },
                    include: { items: true }
                });
            });
            return res.json({ challan: updatedChallan });
        }
        // Handle Transition to Cancelled from Confirmed (Revert stock)
        if (status === 'Cancelled' && challan.status === 'Confirmed') {
            const updatedChallan = await prisma_1.prisma.$transaction(async (tx) => {
                for (const item of challan.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { increment: item.quantity } }
                    });
                    await tx.stockMovementLog.create({
                        data: {
                            productId: item.productId,
                            quantityChanged: item.quantity,
                            movementType: 'IN',
                            reason: `Sales Challan ${challan.challanNumber} Cancelled - Stock Restored`,
                            createdBy: req.user?.name || 'System'
                        }
                    });
                }
                return tx.salesChallan.update({
                    where: { id },
                    data: { status: 'Cancelled' },
                    include: { items: true }
                });
            });
            return res.json({ challan: updatedChallan });
        }
        // Draft -> Cancelled (no stock changes)
        const updatedChallan = await prisma_1.prisma.salesChallan.update({
            where: { id },
            data: { status: 'Cancelled' },
            include: { items: true }
        });
        return res.json({ challan: updatedChallan });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.updateChallanStatus = updateChallanStatus;
//# sourceMappingURL=challanController.js.map