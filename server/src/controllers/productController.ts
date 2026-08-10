import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;
    const lowStock = req.query.lowStock === 'true';
    const pageNum = parseInt(String(req.query.page || '1'), 10) || 1;
    const limitNum = parseInt(String(req.query.limit || '10'), 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
        { location: { contains: search } }
      ];
    }

    let products = await prisma.product.findMany({
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

    if (lowStock) {
      products = products.filter(p => p.currentStock <= p.minStockAlert);
    }

    const total = await prisma.product.count({ where });

    return res.json({
      products,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
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

    const existingSku = await prisma.product.findUnique({ where: { sku: String(sku) } });
    if (existingSku) {
      return res.status(400).json({
        error: {
          code: 'SKU_EXISTS',
          message: `Product with SKU '${sku}' already exists`
        }
      });
    }

    const stockVal = parseInt(String(currentStock || 0), 10) || 0;

    const product = await prisma.product.create({
      data: {
        name: String(name),
        sku: String(sku),
        category: String(category),
        unitPrice: parseFloat(String(unitPrice)),
        currentStock: stockVal,
        minStockAlert: parseInt(String(minStockAlert || 5), 10) || 5,
        location: String(location)
      }
    });

    if (stockVal > 0) {
      await prisma.stockMovementLog.create({
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, category, unitPrice, minStockAlert, location } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ? String(name) : existing.name,
        category: category ? String(category) : existing.category,
        unitPrice: unitPrice !== undefined ? parseFloat(String(unitPrice)) : existing.unitPrice,
        minStockAlert: minStockAlert !== undefined ? parseInt(String(minStockAlert), 10) : existing.minStockAlert,
        location: location ? String(location) : existing.location
      }
    });

    return res.json({ product: updated });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { quantityChanged, movementType, reason } = req.body;

    const qty = parseInt(String(quantityChanged || 0), 10);
    const movType = String(movementType);

    if (!qty || qty <= 0 || !['IN', 'OUT'].includes(movType)) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Valid quantityChanged (>0) and movementType (IN/OUT) are required'
        }
      });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    if (movType === 'OUT' && product.currentStock < qty) {
      return res.status(400).json({
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `Cannot reduce stock by ${qty}. Available stock for SKU '${product.sku}' is only ${product.currentStock}.`
        }
      });
    }

    const newStock = movType === 'IN' ? product.currentStock + qty : product.currentStock - qty;

    const [updatedProduct, log] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { currentStock: newStock }
      }),
      prisma.stockMovementLog.create({
        data: {
          productId: id,
          quantityChanged: qty,
          movementType: movType,
          reason: reason ? String(reason) : `Manual stock ${movType} adjustment`,
          createdBy: req.user?.name || 'System'
        }
      })
    ]);

    return res.json({ product: updatedProduct, log });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getAllStockLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.stockMovementLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        product: {
          select: { name: true, sku: true, category: true }
        }
      }
    });
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
