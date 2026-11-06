import type { OrderStatus, PickupLocation, ReviewLocation, Role } from './constants';

// Response shapes returned by the API (JSON). Dates are ISO strings.

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isPrescriptionRequired: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CartItem {
  productId: number;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isPrescriptionRequired: boolean;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  pickupLocation: PickupLocation;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

export interface OrderDetails extends Order {
  customerPhone: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  userId: number;
  authorName: string;
  location: ReviewLocation;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface StatsOverview {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  averageRating: number;
  unreadMessages: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface DailyOrders {
  date: string;
  orders: number;
  revenue: number;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}
