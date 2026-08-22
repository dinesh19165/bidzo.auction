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
  username?: string;
  email: string;
  phone?: string;
  roleId?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
  type?: 'customer' | 'vendor' | 'admin' | 'delivery' | 'support';
  token?: string;
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
  phoneNumber: string | null;
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

export interface OrderItemRequestDto {
  productVariantId: number;
  quantity: number;
}

export interface OrderRequestDto {
  items: OrderItemRequestDto[];
  addressId: number;
}

export interface OrderItemResponseDto {
  id: number;
  orderId: number;
  productVariantId: number;
  productId?: number;
  quantity: number;
  price: number;
  productName?: string;
  name?: string;
  vendorName?: string;
  sellerName?: string;
}

export interface OrderResponseDto {
  id: number;
  orderDate: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  customerId: number;
  deliveryAddress?: string | Record<string, unknown> | null;
  trackingNumber?: string | null;
  expectedDeliveryDate?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  items?: OrderItemResponseDto[];
}

export interface RazorpayOrderResponse {
  registrationId?: number;
  paymentId?: number;
  razorpayKeyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId?: number;
  internalOrderId?: number;
}

export interface RazorpayVerifyRequestDto {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface AuctionRegistrationStatusResponse {
  paid: boolean;
  status?: string;
  amount?: number;
  paidAt?: string;
  registrationId?: number;
}

export interface PaymentResponseDto {
  id: number;
  amount: number;
  paidAt?: string;
  paymentRef?: string;
  status: string;
  orderId: number;
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

// Customer API Response Types
export interface AddressDto {
  id: number;
  customerId: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistItemDto {
  id: number;
  productId: number;
  customerId: number;
  addedAt: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationDto {
  id: number;
  customerId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ConversationDto {
  id: number;
  participantId: number;
  participantName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewDto {
  id: number;
  productId: number;
  customerId: number;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceDto {
  id: number;
  orderId: number;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  status: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface SupportTicketDto {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  customerId: number;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface WalletDto {
  id: number;
  customerId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionDto {
  id: number;
  walletId: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface SettingsDto {
  id: number;
  customerId: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  currency: string;
  twoFactorEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}
