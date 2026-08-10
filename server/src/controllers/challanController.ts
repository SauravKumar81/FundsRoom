import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const generateChallanNumber = async (): Promise<string> => {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const count = await prisma.salesChallan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `CH-${dateStr}-${nextNum}`;
};

export const getChallans = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const pageNum = parseInt(String(req.query.page || '1'), 10) || 1;
    const limitNum = parseInt(String(req.query.limit || '10'), 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customerName: { contains: search } }
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true
        }
      }),
      prisma.salesChallan.count({ where })
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getChallanById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const challan = await prisma.salesChallan.findUnique({
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, status = 'Draft' } = req.body;
    const initialStatus = String(status);

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Customer ID and at least one line item are required'
        }
      });
    }

    const customer = await prisma.customer.findUnique({ where: { id: String(customerId) } });
    if (!customer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const productIds = items.map((i: any) => String(i.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;
    const preparedItems: Array<{
      productId: string;
      productName: string;
      productSku: string;
      unitPrice: number;
      quantity: number;
    }> = [];

    for (const item of items) {
      const prod = productMap.get(String(item.productId));
      if (!prod) {
        return res.status(404).json({
          error: { code: 'PRODUCT_NOT_FOUND', message: `Product ID '${item.productId}' not found` }
        });
      }

      const qty = parseInt(String(item.quantity || 0), 10);
      if (!qty || qty <= 0) {
        return res.status(400).json({
          error: { code: 'INVALID_QUANTITY', message: `Invalid quantity for product '${prod.name}'` }
        });
      }

      if (initialStatus === 'Confirmed' && prod.currentStock < qty) {
        return res.status(400).json({
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for '${prod.name}' (SKU: ${prod.sku}). Required: ${qty}, Available: ${prod.currentStock}`
          }
        });
      }

      const itemUnitPrice = item.unitPrice !== undefined ? parseFloat(String(item.unitPrice)) : prod.unitPrice;

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

    const newChallan = await prisma.$transaction(async (tx) => {
      const created = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerMobile: customer.mobile,
          totalQuantity,
          totalAmount,
          status: initialStatus,
          createdBy: req.user?.name || 'Sales User',
          items: {
            create: preparedItems
          }
        },
        include: {
          items: true
        }
      });

      if (initialStatus === 'Confirmed') {
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const newStatus = String(req.body.status);

    if (!['Confirmed', 'Cancelled'].includes(newStatus)) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Status can only be updated to Confirmed or Cancelled' }
      });
    }

    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!challan) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Challan not found' } });
    }

    if (challan.status === newStatus) {
      return res.status(400).json({
        error: { code: 'NO_CHANGE', message: `Challan is already in '${newStatus}' status` }
      });
    }

    if (challan.status === 'Cancelled') {
      return res.status(400).json({
        error: { code: 'INVALID_TRANSITION', message: 'Cannot modify a Cancelled challan' }
      });
    }

    if (newStatus === 'Confirmed' && challan.status === 'Draft') {
      const productIds = challan.items.map((i) => i.productId);
      const products = await prisma.product.findMany({
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

      const updatedChallan = await prisma.$transaction(async (tx) => {
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

    if (newStatus === 'Cancelled' && challan.status === 'Confirmed') {
      const updatedChallan = await prisma.$transaction(async (tx) => {
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

    const updatedChallan = await prisma.salesChallan.update({
      where: { id },
      data: { status: 'Cancelled' },
      include: { items: true }
    });

    return res.json({ challan: updatedChallan });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
