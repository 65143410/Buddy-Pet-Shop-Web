export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
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
  isActive?: boolean;
  brand?: string;
  weightVolume?: string;
}

export interface CartProduct extends Product {
  qty: number;
}

export interface Admin {
  adminId: number;
  name: string;
  email: string;
  phone?: string;
}

export interface Staff {
  staffId: number;
  name: string;
  email: string;
  phone?: string;
  position: 'ADMIN' | 'MANAGER' | 'STAFF';
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
  pets?: Pet[];
  orders?: Order[];
  status?: string;
  image?: string;
  createdAt?: string;
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
  staff?: Staff;
  payments: Payment[];
  orderDetails: OrderDetail[];
  invoiceNo?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  shippingCost?: number;
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
  staffId?: number;
  adminId?: number;
}

export interface Pet {
  petId?: number;
  petName: string;
  petType: string;
  congenitalDisease?: string;
  birthdate?: string;
  weight?: number;
  gender?: string;
  breed?: string;
  image?: string;
  isSterilized?: boolean;
}

