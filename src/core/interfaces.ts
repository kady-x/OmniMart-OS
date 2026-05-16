// Core interfaces derived from Supermarket Management System Component Diagrams

// Account Management Interfaces
export interface IAuth {
  login(credentials: any): Promise<any>;
  logout(token: string): Promise<void>;
  verifyToken(token: string): Promise<boolean>;
}

export interface IAccess {
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
}

export interface IProfile {
  getProfile(userId: string): Promise<any>;
  updateProfile(userId: string, data: any): Promise<any>;
}

export interface IUserRepo {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  save(user: any): Promise<any>;
}

// Staff Management Interfaces
export interface IStaffManager {
  addEmployee(data: any): Promise<any>;
  removeEmployee(id: string): Promise<void>;
}

export interface IEmployee {
  getEmployeeDetails(id: string): Promise<any>;
}

export interface IPermission {
  assignRole(employeeId: string, role: string): Promise<void>;
}

// Inventory Management Interfaces
export interface IProduct {
  getProductDetails(productId: string): Promise<any>;
  createProduct(data: any): Promise<any>;
}

export interface IInventory {
  checkStock(productId: string, quantity: number): Promise<boolean>;
  updateStock(productId: string, quantity: number): Promise<void>;
}

export interface IStockRepo {
  getStock(productId: string): Promise<number>;
  setStock(productId: string, quantity: number): Promise<void>;
}

// Order Management Interfaces
export interface IOrder {
  createOrder(cartId: string, customerId: string): Promise<any>;
  getOrderStatus(orderId: string): Promise<string>;
}

export interface IValidate {
  validateOrderDetails(orderData: any): Promise<boolean>;
}

export interface ICalculate {
  calculateTotal(cartId: string): Promise<number>;
}

// Cart Management Interfaces
export interface ICartManager {
  addItem(cartId: string, item: any): Promise<void>;
  removeItem(cartId: string, itemId: string): Promise<void>;
}

export interface IItem {
  getItemDetails(itemId: string): Promise<any>;
}

export interface ISession {
  createSession(userId: string): Promise<string>;
  getSessionCart(sessionId: string): Promise<any>;
}

// Payment Management Interfaces
export interface IPayment {
  processPayment(orderId: string, amount: number, paymentDetails: any): Promise<boolean>;
  refundPayment(transactionId: string): Promise<boolean>;
}

export interface IBank {
  communicateWithGateway(request: any): Promise<any>;
}

export interface ITransaction {
  recordTransaction(data: any): Promise<any>;
}

// Notification & Integration Interfaces
export interface INotification {
  sendNotification(userId: string, message: string): Promise<void>;
}

export interface IDeliver {
  trackDelivery(orderId: string): Promise<any>;
  assignDriver(orderId: string, driverId: string): Promise<void>;
}

export interface ITrack {
  getGPSLocation(entityId: string): Promise<any>;
}
