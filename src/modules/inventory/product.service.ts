import prisma from '../../core/prisma';

export class ProductService {
  /**
   * Get all active products with optional search/category filter
   */
  public async getProducts(filter?: { search?: string; category?: string }) {
    const where: any = { isActive: true };

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { barcode: { contains: filter.search } },
        { category: { contains: filter.search } },
      ];
    }

    if (filter?.category && filter.category !== 'All') {
      where.category = filter.category;
    }

    return prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single product by barcode (for cashier scanning)
   */
  public async getProductByBarcode(barcode: string) {
    const product = await prisma.product.findUnique({ where: { barcode } });
    if (!product || !product.isActive) {
      throw new Error(`Product with barcode ${barcode} not found or is inactive.`);
    }

    // Apply any active promotions
    const activePromo = await prisma.promotion.findFirst({
      where: {
        productId: product.id,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    return {
      ...product,
      discountPct: activePromo?.discountPct ?? 0,
      effectivePrice: activePromo
        ? product.price * (1 - activePromo.discountPct / 100)
        : product.price,
    };
  }

  /**
   * Create a new product (Manager)
   */
  public async createProduct(data: {
    barcode: string;
    name: string;
    description?: string;
    price: number;
    stockLevel: number;
    minStock?: number;
    category: string;
  }) {
    const existing = await prisma.product.findUnique({ where: { barcode: data.barcode } });
    if (existing) throw new Error('Product with this barcode already exists.');

    return prisma.product.create({ data });
  }

  /**
   * Update product details & log price change if price changed
   */
  public async updateProduct(
    productId: string,
    managerId: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stockLevel: number;
      minStock: number;
      category: string;
      isActive: boolean;
    }>
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found.');

    // If price is changing, log it
    if (data.price !== undefined && data.price !== product.price) {
      await prisma.priceLog.create({
        data: {
          productId,
          oldPrice: product.price,
          newPrice: data.price,
          changedBy: managerId,
        },
      });
    }

    return prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  /**
   * Soft delete a product
   */
  public async deleteProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found.');

    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }

  /**
   * Get low-stock products (stockLevel <= minStock)
   */
  public async getLowStockProducts() {
    return prisma.product.findMany({
      where: {
        isActive: true,
        stockLevel: { lte: prisma.product.fields.minStock as any },
      },
    }).catch(() =>
      // Fallback query if prisma field ref doesn't work in this version
      prisma.$queryRaw`SELECT * FROM Product WHERE isActive = 1 AND stockLevel <= minStock`
    );
  }

  /**
   * Get all categories
   */
  public async getCategories() {
    const result = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isActive: true },
    });
    return result.map((r) => r.category);
  }

  /**
   * Add or create a promotion
   */
  public async createPromotion(data: {
    productId: string;
    discountPct: number;
    startDate: string;
    endDate: string;
  }) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Product not found.');

    return prisma.promotion.create({
      data: {
        productId: data.productId,
        discountPct: data.discountPct,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: true,
      },
    });
  }

  /**
   * Get price history for a product
   */
  public async getPriceHistory(productId: string) {
    return prisma.priceLog.findMany({
      where: { productId },
      include: { manager: { select: { username: true, fullName: true } } },
      orderBy: { changedAt: 'desc' },
    });
  }
}
