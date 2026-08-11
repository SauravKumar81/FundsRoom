import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    { name: 'Alice Admin', email: 'admin@fundsroom.com', role: 'Admin' },
    { name: 'Sam Sales', email: 'sales@fundsroom.com', role: 'Sales' },
    { name: 'Wanda Warehouse', email: 'warehouse@fundsroom.com', role: 'Warehouse' },
    { name: 'Arthur Accounts', email: 'accounts@fundsroom.com', role: 'Accounts' }
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password: passwordHash },
      create: { name: u.name, email: u.email, role: u.role, password: passwordHash }
    });
  }
  console.log('✅ Users seeded: admin@fundsroom.com, sales@fundsroom.com, warehouse@fundsroom.com, accounts@fundsroom.com (Password: Password123!)');

  const customerCount = await prisma.customer.count();
  if (customerCount > 0) {
    console.log('✅ Database already populated. Skipping duplicate seeding.');
    return;
  }

  // 2. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Sharma',
      mobile: '+91 98765 43210',
      email: 'rajesh@apexdistributors.com',
      businessName: 'Apex Wholesale & Distribution',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: 'Distributor',
      address: 'Plot 45, MIDC Industrial Area, Mumbai, India',
      status: 'Active',
      followUpDate: '2026-08-15',
      notes: 'Interested in bulk electronics & cable stock for upcoming Q3 promotion.'
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Patel',
      mobile: '+91 91234 56789',
      email: 'priya@techmartretail.in',
      businessName: 'TechMart Retail Stores',
      gstNumber: '24BBBCC1111B2Z8',
      customerType: 'Retail',
      address: 'Shop 12, Commercial Hub, Ahmedabad, India',
      status: 'Lead',
      followUpDate: '2026-08-12',
      notes: 'Initial inquiry regarding smart sensors and LED display panels.'
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Vikram Mehta',
      mobile: '+91 99887 76655',
      email: 'vikram@sunrisetraders.org',
      businessName: 'Sunrise Wholesale Agencies',
      gstNumber: '29CCCCD2222C3Z1',
      customerType: 'Wholesale',
      address: '22 Grain Market Road, Bengaluru, India',
      status: 'Active',
      followUpDate: '2026-08-20',
      notes: 'Regular buyer of networking gear.'
    }
  });

  console.log('✅ Customers seeded');

  // 3. Seed Initial Follow-up Note
  await prisma.customerFollowUp.create({
    data: {
      customerId: customer1.id,
      note: 'Sent revised product catalog and tier discounts.',
      followUpDate: '2026-08-15',
      createdBy: 'Sam Sales'
    }
  });

  // 4. Seed Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Industrial Cat6 Cable Drum 305m',
      sku: 'CAB-CAT6-305M',
      category: 'Networking',
      unitPrice: 4500.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Warehouse A - Rack 2'
    }
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Gigabit 24-Port Managed Switch',
      sku: 'NET-SW-24P-GB',
      category: 'Networking',
      unitPrice: 12500.0,
      currentStock: 18,
      minStockAlert: 5,
      location: 'Warehouse A - Shelf 4'
    }
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Wireless Dual-Band AP Enterprise',
      sku: 'NET-AP-WIFI6',
      category: 'Wireless',
      unitPrice: 7800.0,
      currentStock: 4,
      minStockAlert: 8,
      location: 'Warehouse B - Bin 12'
    }
  });

  const prod4 = await prisma.product.create({
    data: {
      name: '12V 5A Industrial Power Supply Unit',
      sku: 'PWR-12V-5A',
      category: 'Power',
      unitPrice: 1400.0,
      currentStock: 100,
      minStockAlert: 20,
      location: 'Warehouse B - Shelf 1'
    }
  });

  console.log('✅ Products seeded');

  // 5. Seed Stock Movement Logs
  const products = [prod1, prod2, prod3, prod4];
  for (const p of products) {
    await prisma.stockMovementLog.create({
      data: {
        productId: p.id,
        quantityChanged: p.currentStock,
        movementType: 'IN',
        reason: 'Initial warehouse inventory audit setup',
        createdBy: 'Wanda Warehouse'
      }
    });
  }

  // 6. Seed Sample Sales Challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-202608-0001',
      customerId: customer1.id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerMobile: customer1.mobile,
      totalQuantity: 5,
      totalAmount: 22500.0,
      status: 'Confirmed',
      createdBy: 'Sam Sales',
      items: {
        create: [
          {
            productId: prod1.id,
            productName: prod1.name,
            productSku: prod1.sku,
            unitPrice: 4500.0,
            quantity: 5
          }
        ]
      }
    }
  });

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-202608-0002',
      customerId: customer3.id,
      customerName: customer3.name,
      customerEmail: customer3.email,
      customerMobile: customer3.mobile,
      totalQuantity: 2,
      totalAmount: 25000.0,
      status: 'Draft',
      createdBy: 'Sam Sales',
      items: {
        create: [
          {
            productId: prod2.id,
            productName: prod2.name,
            productSku: prod2.sku,
            unitPrice: 12500.0,
            quantity: 2
          }
        ]
      }
    }
  });

  console.log('✅ Sales Challans seeded');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
