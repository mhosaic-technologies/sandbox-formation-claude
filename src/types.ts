export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type NotificationChannel = "push" | "email" | "in_app";
export type NotificationStatus = "pending" | "sent" | "failed" | "read";
export interface Notification { id: string; userId: string; channel: NotificationChannel; title: string; body: string; data?: Record<string, unknown>; status: NotificationStatus; createdAt: Date; sentAt?: Date; readAt?: Date; }
export interface CreateNotificationInput { channel: NotificationChannel; title: string; body: string; data?: Record<string, unknown>; }
