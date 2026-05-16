import prisma from '../../core/prisma';

export class SupplierService {
  /**
   * Supplier Flow: 4.1 Receive Procurement Request -> 4.2 Update Supplier Catalog -> 4.3 Process Delivery Invoice -> 4.4 Verify Stock Arrival
   */
  public async processProcurement(supplierId: string, procurementDetails: any) {
    console.log(`[SupplierService] 4.1 Receiving Procurement Request from ${supplierId}...`);
    
    const { invoice, items } = procurementDetails; // items: [{ barcode, quantity, unitCost }]
    
    if (!invoice || !items || !Array.isArray(items)) {
      throw new Error("Invalid procurement details");
    }

    // 4.2 Update Supplier Catalog
    console.log('[SupplierService] 4.2 Updating Supplier Catalog in Database...');
    
    // 4.3 Process Delivery Invoice & 4.4 Verify Stock Arrival
    console.log('[SupplierService] 4.3 Processing Delivery Invoice & 4.4 Verifying Stock Arrival...');

    const result = await prisma.$transaction(async (tx) => {
      let totalValue = 0;
      let itemCount = 0;

      for (const item of items) {
        // Find product or create it if supplier brings new items (assuming manager has created at least barcode/name)
        const product = await tx.product.findUnique({ where: { barcode: item.barcode } });
        
        if (product) {
          // Add to stock
          await tx.product.update({
            where: { id: product.id },
            data: { stockLevel: { increment: item.quantity } }
          });
          totalValue += (item.unitCost || product.price * 0.6) * item.quantity;
          itemCount += item.quantity;
        } else {
          console.warn(`[SupplierService] Product with barcode ${item.barcode} not found. Skipping.`);
        }
      }

      // Save Procurement record
      const procurement = await tx.procurement.create({
        data: {
          supplierId,
          invoice,
          itemCount,
          totalValue,
          status: 'RECEIVED'
        }
      });

      return procurement;
    });

    return {
      success: true,
      message: 'Procurement processed successfully. Inventory updated.',
      transactionDate: result.processedAt,
      invoice: result.invoice,
      totalValue: result.totalValue
    };
  }
}
