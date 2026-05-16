import { Router } from 'express';
import { ProductController } from './product.controller';

const router = Router();
const productController = new ProductController();

// Public/Cashier: Get all products & filter
router.get('/', productController.getAll.bind(productController));
router.get('/categories', productController.getCategories.bind(productController));
router.get('/barcode/:barcode', productController.getByBarcode.bind(productController));
router.get('/:productId/price-history', productController.getPriceHistory.bind(productController));

// Manager: Create, update, delete products
router.post('/', productController.create.bind(productController));
router.put('/:productId', productController.update.bind(productController));
router.delete('/:productId', productController.delete.bind(productController));

// Manager: Create promotions
router.post('/promotions', productController.createPromotion.bind(productController));

export default router;
