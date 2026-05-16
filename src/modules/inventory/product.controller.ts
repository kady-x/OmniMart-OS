import { Request, Response } from 'express';
import { ProductService } from './product.service';

const productService = new ProductService();

export class ProductController {

  public async getAll(req: Request, res: Response) {
    try {
      const { search, category } = req.query as any;
      const products = await productService.getProducts({ search, category });
      res.status(200).json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getByBarcode(req: Request, res: Response) {
    try {
      const { barcode } = req.params;
      const product = await productService.getProductByBarcode(barcode);
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const product = await productService.createProduct(data);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const managerId = (req as any).user?.id;
      const product = await productService.updateProduct(productId, managerId, req.body);
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const result = await productService.deleteProduct(productId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getCategories();
      res.status(200).json({ success: true, data: ['All', ...categories] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createPromotion(req: Request, res: Response) {
    try {
      const promo = await productService.createPromotion(req.body);
      res.status(201).json({ success: true, data: promo });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getPriceHistory(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const history = await productService.getPriceHistory(productId);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
