import { Request, Response } from 'express';
import { CashierService } from './cashier.service';

const cashierService = new CashierService();

export class CashierController {

  public async scan(req: Request, res: Response) {
    try {
      const { barcodes } = req.body;
      if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty barcodes array.' });
      }
      const cartData = await cashierService.scanItems(barcodes);
      res.status(200).json({ success: true, data: cartData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async checkout(req: Request, res: Response) {
    try {
      const { cartData, paymentDetails, orderId } = req.body;
      if (!cartData || !paymentDetails) {
        return res.status(400).json({ success: false, message: 'Cart data and payment details are required.' });
      }
      const cashierId = (req as any).user?.id;
      const result = await cashierService.processCheckout(cartData, paymentDetails, cashierId, orderId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getDailySummary(req: Request, res: Response) {
    try {
      const summary = await cashierService.getDailySummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
