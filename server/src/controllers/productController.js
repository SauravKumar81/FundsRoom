"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStockLogs = exports.adjustStock = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const auth_1 = require("../middleware/auth");
const getProducts = async (req, res) => {
    try {
        const { search, category, lowStock, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (category) {
            where.category = category;
        }
        if (search) {
            const query = search;
            where.OR = [
                { name: { contains: query } },
                { sku: { contains: query } },
                { category: { contains: query } },
                { location: { contains: query } }
            ];
        }
        let products = await prisma_1.prisma.product.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { stockLogs: true }
                }
            }
        });
        if (lowStock === 'true') {
            products = products.filter(p => p.currentStock <= p.minStockAlert);
        }
        const total = await prisma_1.prisma.product.count({ where });
        return res.json({
            products,
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
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: {
                stockLogs: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!product) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        }
        return res.json({ product });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;
        if (!name || !sku || !category || unitPrice === undefined || location === undefined) {
            return res.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Missing required product fields (name, sku, category, unitPrice, location)'
                }
            });
        }
        const existingSku = await prisma_1.prisma.product.findUnique({ where: { sku } });
        if (existingSku) {
            return res.status(400).json({
                error: {
                    code: 'SKU_EXISTS',
                    message: `Product with SKU '${sku}' already exists`
                }
            });
        }
        const stockVal = parseInt(currentStock, 10) || 0;
        const product = await prisma_1.prisma.product.create({
            data: {
                name,
                sku,
                category,
                unitPrice: parseFloat(unitPrice),
                currentStock: stockVal,
                minStockAlert: parseInt(minStockAlert, 10) || 5,
                location
            }
        });
        if (stockVal > 0) {
            await prisma_1.prisma.stockMovementLog.create({
                data: {
                    productId: product.id,
                    quantityChanged: stockVal,
                    movementType: 'IN',
                    reason: 'Initial stock intake',
                    createdBy: req.user?.name || 'System'
                }
            });
        }
        return res.status(201).json({ product });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, unitPrice, minStockAlert, location } = req.body;
        const existing = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        }
        const updated = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                name: name || existing.name,
                category: category || existing.category,
                unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
                minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert, 10) : existing.minStockAlert,
                location: location || existing.location
            }
        });
        return res.json({ product: updated });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.updateProduct = updateProduct;
const adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantityChanged, movementType, reason } = req.body;
        const qty = parseInt(quantityChanged, 10);
        if (!qty || qty <= 0 || !['IN', 'OUT'].includes(movementType)) {
            return res.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Valid quantityChanged (>0) and movementType (IN/OUT) are required'
                }
            });
        }
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        }
        if (movementType === 'OUT' && product.currentStock < qty) {
            return res.status(400).json({
                error: {
                    code: 'INSUFFICIENT_STOCK',
                    message: `Cannot reduce stock by ${qty}. Available stock for SKU '${product.sku}' is only ${product.currentStock}.`
                }
            });
        }
        const newStock = movementType === 'IN' ? product.currentStock + qty : product.currentStock - qty;
        const [updatedProduct, log] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.product.update({
                where: { id },
                data: { currentStock: newStock }
            }),
            prisma_1.prisma.stockMovementLog.create({
                data: {
                    productId: id,
                    quantityChanged: qty,
                    movementType,
                    reason: reason || `Manual stock ${movementType} adjustment`,
                    createdBy: req.user?.name || 'System'
                }
            })
        ]);
        return res.json({ product: updatedProduct, log });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.adjustStock = adjustStock;
const getAllStockLogs = async (req, res) => {
    try {
        const logs = await prisma_1.prisma.stockMovementLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                product: {
                    select: { name: true, sku: true, category: true }
                }
            }
        });
        return res.json({ logs });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
    }
};
exports.getAllStockLogs = getAllStockLogs;
//# sourceMappingURL=productController.js.map