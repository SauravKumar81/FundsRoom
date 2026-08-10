import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const customerType = req.query.customerType ? String(req.query.customerType) : undefined;
    const pageNum = parseInt(String(req.query.page || '1'), 10) || 1;
    const limitNum = parseInt(String(req.query.limit || '10'), 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
        { businessName: { contains: search } },
        { gstNumber: { contains: search } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
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
      prisma.customer.count({ where })
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const customer = await prisma.customer.findUnique({
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
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
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

    const customer = await prisma.customer.create({
      data: {
        name: String(name),
        mobile: String(mobile),
        email: String(email),
        businessName: String(businessName),
        gstNumber: gstNumber ? String(gstNumber) : null,
        customerType: String(customerType),
        address: String(address),
        status: status ? String(status) : 'Active',
        followUpDate: followUpDate ? String(followUpDate) : null,
        notes: notes ? String(notes) : null
      }
    });

    if (notes) {
      await prisma.customerFollowUp.create({
        data: {
          customerId: customer.id,
          note: String(notes),
          followUpDate: followUpDate ? String(followUpDate) : null,
          createdBy: req.user?.name || 'System'
        }
      });
    }

    return res.status(201).json({ customer });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: name ? String(name) : existing.name,
        mobile: mobile ? String(mobile) : existing.mobile,
        email: email ? String(email) : existing.email,
        businessName: businessName ? String(businessName) : existing.businessName,
        gstNumber: gstNumber !== undefined ? (gstNumber ? String(gstNumber) : null) : existing.gstNumber,
        customerType: customerType ? String(customerType) : existing.customerType,
        address: address ? String(address) : existing.address,
        status: status ? String(status) : existing.status,
        followUpDate: followUpDate !== undefined ? (followUpDate ? String(followUpDate) : null) : existing.followUpDate,
        notes: notes !== undefined ? (notes ? String(notes) : null) : existing.notes
      }
    });

    return res.json({ customer: updated });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const addFollowUpNote = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { note, followUpDate } = req.body;

    if (!note) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Note text is required' } });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const fDate = followUpDate ? String(followUpDate) : customer.followUpDate;

    const [followUpNote] = await Promise.all([
      prisma.customerFollowUp.create({
        data: {
          customerId: id,
          note: String(note),
          followUpDate: fDate,
          createdBy: req.user?.name || 'System'
        }
      }),
      prisma.customer.update({
        where: { id },
        data: {
          followUpDate: fDate,
          notes: String(note)
        }
      })
    ]);

    return res.status(201).json({ followUpNote });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
