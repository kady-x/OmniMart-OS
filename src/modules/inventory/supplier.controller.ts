import { Request, Response } from 'express';
import { SupplierService } from './supplier.service';

const supplierService = new SupplierService();

export class SupplierController {
  
  public async handleProcurement(req: Request, res: Response) {
    try {
      const supplierId = (req as any).user?.id || 'sup_456';
      const procurementDetails = req.body;

      const result = await supplierService.processProcurement(supplierId, procurementDetails);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
