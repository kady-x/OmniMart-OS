import { Router } from 'express';
import { SupplierController } from './supplier.controller';

const router = Router();
const supplierController = new SupplierController();

// Supplier Flow: Process Procurement
router.post('/procurement', supplierController.handleProcurement.bind(supplierController));

export default router;
