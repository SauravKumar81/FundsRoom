export type Tab = 'dashboard' | 'customers' | 'products' | 'challans' | 'logs';

export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  followUpDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  followUps?: CustomerFollowUp[];
  _count?: {
    followUps: number;
    challans: number;
  };
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt?: string;
  updatedAt?: string;
  stockLogs?: StockMovementLog[];
  _count?: {
    stockLogs: number;
  };
}

export interface StockMovementLog {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
    category: string;
  };
}

export interface ChallanItem {
  id?: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string | null;
  customerMobile?: string | null;
  totalQuantity: number;
  totalAmount: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  items: ChallanItem[];
  customer?: Customer;
}
