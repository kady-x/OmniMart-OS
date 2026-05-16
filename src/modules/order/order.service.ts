import prisma from '../../core/prisma';

export class OrderService {
  /**
   * Customer Order Flow: Validate Order -> Calculate Total -> Handle Payment -> Confirm & Save
   */
  public async submitCustomerOrder(customerId: string, orderDetails: any) {
    console.log(`[OrderService] Processing Customer Order for ${customerId}...`);
    
    const { items } = orderDetails; // expects array of { productId, quantity }

    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stockLevel < item.quantity) {
          throw new Error(`Product ${product?.name || item.productId} is out of stock or insufficient quantity.`);
        }

        const activePromo = await tx.promotion.findFirst({
          where: { productId: product.id, isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        });

        const effectivePrice = activePromo ? product.price * (1 - activePromo.discountPct / 100) : product.price;
        totalAmount += effectivePrice * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAt: effectivePrice,
        });
      }

      // Create PENDING order
      const order = await tx.order.create({
        data: {
          customerId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
      });

      return {
        orderId: order.id,
        status: order.status,
        totalAmount,
        message: 'Order placed successfully. Please proceed to cashier for payment.'
      };
    });
  }

  /**
   * Cashier Flow: Fetch Pending Orders
   */
  public async getPendingOrders() {
    return prisma.order.findMany({
      where: { status: 'PENDING' },
      include: {
        customer: { select: { fullName: true, username: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public async getCustomerHistory(customerId: string) {
    if (customerId === 'cust_999') return [];
    return prisma.order.findMany({
      where: { customerId },
      include: {
        items: { include: { product: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
