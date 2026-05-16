import { Router } from 'express';
import { CashierController } from './cashier.controller';

const router = Router();
const cashierController = new CashierController();

// Cashier Flow: Scan item & Calculate Total
router.post('/scan', cashierController.scan.bind(cashierController));

// Cashier Flow: Record payment & Print receipt
router.post('/checkout', cashierController.checkout.bind(cashierController));

// Cashier: Daily summary
router.get('/daily-summary', cashierController.getDailySummary.bind(cashierController));

export default router;
