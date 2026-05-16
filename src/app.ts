import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import salesRoutes from './modules/sales/sales.routes';
import orderRoutes from './modules/order/order.routes';
import cashierRoutes from './modules/order/cashier.routes';
import supplierRoutes from './modules/inventory/supplier.routes';
import productRoutes from './modules/inventory/product.routes';
import authRoutes from './modules/account/auth.routes';
import { validateSession, requireRole } from './core/middleware/auth.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security and Logging Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local testing/dev, enable in prod if needed
}));
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Serve Static Frontend UI
import path from 'path';
app.use(express.static(path.join(__dirname, '../public')));

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Supermarket Management System Backend is running.' });
});

// Mounted Module Routes
app.use('/api/v1/auth', authRoutes);

// Protected Routes
app.use('/api/v1/sales', validateSession, requireRole(['manager']), salesRoutes);
app.use('/api/v1/cashier', validateSession, requireRole(['cashier', 'manager']), cashierRoutes);
app.use('/api/v1/supplier', validateSession, requireRole(['supplier', 'manager']), supplierRoutes);
app.use('/api/v1/orders', validateSession, orderRoutes);
app.use('/api/v1/inventory', validateSession, productRoutes);
// app.use('/api/v1/accounts', accountRoutes);
// app.use('/api/v1/cart', cartRoutes);
// app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/staff', staffRoutes);

// Global Error Handler for Deployment Stability
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Logger]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
