import prisma from '../../core/prisma';
import { ProductService } from '../inventory/product.service';

const productService = new ProductService();

export class CashierService {
  /**
   * Cashier Flow: 3.1 Scan Items by barcode -> 3.2 Calculate Total
   * Fetches real product data from DB and applies any active promotions
   */
  public async scanItems(barcodes: string[]) {
    console.log('[CashierService] 3.1 Scanning items...', barcodes);

    const items = await Promise.all(
      barcodes.map((barcode) => productService.getProductByBarcode(barcode))
    );

    // 3.2 Calculate Total (with promotions applied)
    console.log('[CashierService] 3.2 Calculating Total...');
    const amountTotal = items.reduce((sum, item) => sum + item.effectivePrice, 0);

    return {
      items: items.map((p) => ({
        productId: p.id,
        barcode: p.barcode,
        name: p.name,
        price: p.price,
        discountPct: p.discountPct,
        effectivePrice: p.effectivePrice,
      })),
      amountTotal: Math.round(amountTotal * 100) / 100,
    };
  }

  /**
   * Cashier Flow: 3.3 Record Payment -> 3.4 Print Receipt
   * Creates a real Order, OrderItems, and Payment record; deducts stock
   */
  public async processCheckout(
    cartData: { items: Array<{ productId: string; name: string; effectivePrice: number; quantity?: number }>; amountTotal: number },
    paymentDetails: { method: string; amount: number },
    cashierId?: string,
    orderId?: string
  ) {
    console.log('[CashierService] 3.3 Recording Payment and deducting stock...');

    // Validate stock availability for all items
    for (const item of cartData.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const qty = item.quantity || 1;
      if (!product || product.stockLevel < qty) {
        throw new Error(`Insufficient stock for product: ${item.name || item.productId}`);
      }
    }

    // Use a Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      let order;

      if (orderId) {
        // Update existing PENDING order
        order = await tx.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
          include: { items: true }
        });
      } else {
        // Create new Order
        order = await tx.order.create({
          data: {
            customerId: null, // Guest checkout at cashier
            totalAmount: cartData.amountTotal,
            status: 'CONFIRMED',
            items: {
              create: cartData.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity || 1,
                priceAt: item.effectivePrice,
              })),
            },
          },
          include: { items: true },
        });
      }

      // Create Payment Record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amountPaid: paymentDetails.amount,
          paymentMethod: paymentDetails.method,
          status: 'COMPLETED',
        },
      });

      // Deduct Stock for each product
      for (const item of cartData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockLevel: { decrement: item.quantity || 1 } },
        });
      }

      return { order, payment };
    });

    // 3.4 Generate Receipt
    const receipt = {
      transactionId: result.payment.transactionId,
      orderId: result.order.id,
      date: result.payment.paidAt,
      items: cartData.items,
      totalPaid: paymentDetails.amount,
      paymentMethod: paymentDetails.method,
      status: 'PAID',
    };

    console.log('[CashierService] 3.4 Receipt generated:', receipt.transactionId);
    return { success: true, receipt };
  }

  /**
   * Get today's sales summary for cashier
   */
  public async getDailySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'CANCELLED' },
      },
      include: { payment: true, items: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTransactions = orders.length;

    return {
      date: today.toISOString().split('T')[0],
      totalSales: Math.round(totalSales * 100) / 100,
      totalTransactions,
      orders: orders.map((o) => ({
        orderId: o.id,
        amount: o.totalAmount,
        paymentMethod: o.payment?.paymentMethod ?? 'UNKNOWN',
        time: o.createdAt,
      })),
    };
  }
}
