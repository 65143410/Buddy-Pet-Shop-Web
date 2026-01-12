export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Product {
  productId: number;
  productName: string;
  price: number;
  stock: number;
  description: string;
  targetPetType: string;
  suitableForDisease: string;
  category: {
    categoryId: number;
    categoryName?: string;
  };
  image?: string;
}

export interface CartProduct extends Product {
  qty: number;
}

export interface Admin {
  adminId: number;
  name: string;
  email: string;
}

export interface Staff {
  staffId: number;
  name: string;
  email: string;
  phone?: string;
  position: 'SALES' | 'DELIVERY' | 'ADMIN';
  role?: string;
  status: string;
  password?: string;
}

export interface Customer {
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  address?: string;
  orders?: Order[];
}

export interface Payment {
  paymentId: number;
  paymentDate: string;
  amount: number;
  method: string;
  slipImage: string;
}

export interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  customer: Customer;
  status: OrderStatus;
  payments: Payment[];
  orderDetails: OrderDetail[];
  invoiceNo?: string;
}

export interface OrderStatus {
  statusId: number;
  statusName: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
  trendClass?: 'up' | 'down' | 'normal';
}

export interface SystemConfig {
  shopName: string;
  vatRate: number;
  shippingFee: number;
  lowStockAlert: number;
  contactEmail: string;
}
export interface OrderDetail {
  orderDetailId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}
export interface VerifyOrderPayload {
  isApproved: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface OrderRequestDTO {
  order: Partial<Order>;
  details: OrderDetail[];
}

export interface TopSeller {
  productName: string;
  totalSold: number;
  revenue?: number;
}
export interface ProductLog {
  logId?: number;
  productId: number;
  productName: string;
  action: 'ADD' | 'UPDATE' | 'DELETE' | 'STOCK_ADJUST';
  quantityChange: number;
  finalStock?: number;
  staffName: string;
  notes?: string;
  timestamp: string | Date;
}
