import { Router } from 'express';
import { SalesController } from './sales.controller';

const router = Router();
const salesController = new SalesController();

// Manager Sales Flow: Request Sales Report
router.get('/report', salesController.getReport.bind(salesController));

// Manager Sales Flow (ALT): Update Config / Prices
router.put('/config', salesController.updateConfig.bind(salesController));

export default router;
