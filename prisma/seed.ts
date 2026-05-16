import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Clear existing data (optional, be careful in production) ---
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.priceLog.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.procurement.deleteMany();
  await prisma.user.deleteMany();

  // --- Seed Users ---
  const managerPassword = await bcrypt.hash('admin', 10);
  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      password: managerPassword,
      role: 'MANAGER',
      fullName: 'Supermarket Manager',
      email: 'manager@supermarket.com',
    },
  });

  const cashierPassword = await bcrypt.hash('cash', 10);
  const cashier = await prisma.user.create({
    data: {
      username: 'cashier',
      password: cashierPassword,
      role: 'CASHIER',
      fullName: 'Front Cashier',
      email: 'cashier@supermarket.com',
    },
  });

  const supplierPassword = await bcrypt.hash('supply', 10);
  const supplier = await prisma.user.create({
    data: {
      username: 'supplier',
      password: supplierPassword,
      role: 'SUPPLIER',
      fullName: 'Main Supplier',
      email: 'supplier@supermarket.com',
    },
  });

  const customerPassword = await bcrypt.hash('cust', 10);
  const customer = await prisma.user.create({
    data: {
      username: 'customer',
      password: customerPassword,
      role: 'CUSTOMER',
      fullName: 'Valued Customer',
      email: 'customer@supermarket.com',
    },
  });
  
  console.log('Users seeded.');

  // --- Seed Products ---
  const productsData = [
    { barcode: '123456', name: 'Organic Milk 1L', price: 2.50, stockLevel: 50, category: 'Dairy' },
    { barcode: '789012', name: 'Whole Wheat Bread', price: 3.20, stockLevel: 30, category: 'Bakery' },
    { barcode: '345678', name: 'Free Range Eggs 12pk', price: 4.80, stockLevel: 40, category: 'Dairy' },
    { barcode: '901234', name: 'Premium Coffee Beans', price: 12.99, stockLevel: 15, category: 'Beverages' },
    { barcode: '567890', name: 'Apples 1kg', price: 5.50, stockLevel: 100, category: 'Produce' },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: p
    });
  }

  console.log('Products seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
