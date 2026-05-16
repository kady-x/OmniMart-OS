import { Request, Response } from 'express';
import { SalesService } from './sales.service';

const salesService = new SalesService();

export class SalesController {
  
  // Handles the 'Request Sales Report' flow from Sequence Diagram
  public async getReport(req: Request, res: Response) {
    try {
      // Auth validation is assumed to be handled by a middleware before this route
      const managerId = (req as any).user?.id || 'mgr_123';
      const dateRange = req.query as any;

      const report = await salesService.getSalesReport(managerId, dateRange);
      
      // Return 'Provide Sales Report'
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handles the 'Modify Sales Parameters' (ALT) flow from Sequence Diagram
  public async updateConfig(req: Request, res: Response) {
    try {
      const managerId = (req as any).user?.id || 'mgr_123';
      const newConfig = req.body;

      const result = await salesService.updateSalesConfig(managerId, newConfig);
      
      // Return 'Update Success' & 'Show Confirmation'
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
