import { Router } from 'express';
import { OrderController } from './order.controller';

const router = Router();
const orderController = new OrderController();

// Customer Flow: Submit Order
router.post('/submit', orderController.submitOrder.bind(orderController));

// Customer Flow: Order History
router.get('/history', orderController.getHistory.bind(orderController));

// Cashier Flow: Get Pending Orders
router.get('/pending', orderController.getPending.bind(orderController));

export default router;
