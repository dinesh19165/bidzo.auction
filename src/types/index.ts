export type RouteState = 'loading' | 'success' | 'error' | 'empty';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
  type?: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  vendorVerified?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

export interface Organization {
  id: string;
  name: string;
  code?: string;
  type?: string;
  status?: string;
  createdAt?: string;
}

export interface Franchise {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  locationId?: string;
  status?: string;
}

export interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  gstNumber?: string;
  verified?: boolean;
  rating?: number;
}

export interface Customer {
  id: string;
  userId: string;
  loyaltyScore?: number;
  preferredLocation?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  vehicleType?: string;
  phone?: string;
  status?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  categoryId?: string;
  vendorId?: string;
  images?: ProductImage[];
  stock?: number;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
}

export interface Auction {
  id: string;
  title: string;
  productId?: string;
  startTime?: string;
  endTime?: string;
  startingBid?: number;
  currentBid?: number;
  status?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  status?: string;
  totalAmount: number;
  items?: OrderItem[];
  createdAt?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency?: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method?: string;
  status?: string;
  amount: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber?: string;
  totalAmount: number;
  issuedAt?: string;
}

export interface Review {
  id: string;
  entityType: 'product' | 'vendor' | 'service';
  entityId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt?: string;
}

export interface Chat {
  id: string;
  userIds: string[];
  title?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status?: string;
  createdAt?: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt?: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content?: string;
  status?: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  updatedAt?: string;
}
