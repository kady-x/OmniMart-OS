import { Request, Response } from 'express';
import { OrderService } from './order.service';

const orderService = new OrderService();

export class OrderController {
  
  public async submitOrder(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || 'cust_999';
      const { orderDetails } = req.body;

      if (!orderDetails) {
        return res.status(400).json({ success: false, message: 'Missing order details.' });
      }

      const result = await orderService.submitCustomerOrder(customerId, orderDetails);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getPending(req: Request, res: Response) {
    try {
      const pendingOrders = await orderService.getPendingOrders();
      res.status(200).json({ success: true, data: pendingOrders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getHistory(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || 'cust_999';
      const history = await orderService.getCustomerHistory(customerId);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
