import prisma from '../../core/prisma';

export class SalesService {
  /**
   * Fetches sales data and computes revenue as per Sequence Diagram
   */
  public async getSalesReport(managerId: string, dateRange: { startDate?: string; endDate?: string }) {
    console.log(`[SalesService] Fetching sales data for manager ${managerId}...`);
    
    let whereClause: any = {
      status: { not: 'CANCELLED' }
    };

    if (dateRange.startDate && dateRange.endDate) {
      whereClause.createdAt = {
        gte: new Date(dateRange.startDate),
        lte: new Date(dateRange.endDate)
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { product: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Compute Revenue (Process 2.1 in DFD)
    let totalRevenue = 0;
    let totalDiscounts = 0;

    const transactions = orders.map(order => {
      // Calculate what the order would have been without discounts (approximated based on current product price, which isn't perfect if prices changed, but good for demo)
      // Ideally we would log the discount amount at the time of sale. We'll use order.discount if available.
      totalRevenue += order.totalAmount;
      totalDiscounts += order.discount;

      return {
        orderId: order.id,
        amount: order.totalAmount,
        discount: order.discount,
        status: order.status,
        date: order.createdAt
      };
    });

    const netRevenue = totalRevenue - totalDiscounts;

    return {
      totalRevenue,
      totalDiscounts,
      netRevenue,
      transactionCount: transactions.length,
      transactions,
      generatedAt: new Date()
    };
  }

  /**
   * Manager Updates Prices / Configuration as per Sequence Diagram (ALT flow)
   */
  public async updateSalesConfig(managerId: string, newConfig: any) {
    console.log(`[SalesService] Manager ${managerId} is updating sales configuration.`, newConfig);

    // E.g., batch updating prices or creating promotions across categories
    if (newConfig.globalDiscountPct && newConfig.category) {
       // Mock logic: we would create promotions for all products in a category
       const products = await prisma.product.findMany({ where: { category: newConfig.category, isActive: true } });
       
       for (const p of products) {
         await prisma.promotion.create({
           data: {
             productId: p.id,
             discountPct: newConfig.globalDiscountPct,
             startDate: new Date(),
             endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
             isActive: true
           }
         });
       }
    }

    return {
      success: true,
      message: 'Sales parameters updated successfully.',
      updatedConfig: newConfig
    };
  }
}
