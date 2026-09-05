type OrderRecord = Record<string, any>;

function firstValue(...values: any[]): any {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

export function formatOrderNumber(order: OrderRecord): string {
  const id = firstValue(order.id, order.orderId);
  const raw = firstValue(order.orderNumber, order.number);
  if (typeof raw === 'string' && /^BIDZO-/i.test(raw)) return raw;
  return id !== undefined ? `BIDZO-${id}` : String(raw ?? 'BIDZO-N/A');
}

export function getOrderItem(order: OrderRecord): OrderRecord {
  return Array.isArray(order.items) && order.items[0] ? order.items[0] : {};
}

export function getOrderProductName(order: OrderRecord): string {
  const item = getOrderItem(order);
  return String(firstValue(order.productName, order.product?.name, order.product, item.productName, item.name, item.product?.name) ?? 'Product');
}

export function getOrderType(order: OrderRecord): 'Auction' | 'Direct Buy' | 'N/A' {
  const raw = String(firstValue(order.orderType, order.type, order.sellingType, order.itemType, order.auctionId, getOrderItem(order).auctionId) ?? '').toUpperCase();
  if (raw.includes('AUCTION') || raw !== '' && raw !== 'FALSE' && raw !== '0' && raw !== 'N/A' && (order.auctionId || getOrderItem(order).auctionId)) return 'Auction';
  if (raw.includes('DIRECT') || raw.includes('PRODUCT') || raw === 'BUY_NOW') return 'Direct Buy';
  return 'N/A';
}

export function getOrderVendor(order: OrderRecord): string {
  const item = getOrderItem(order);
  return String(firstValue(order.vendorName, order.vendor?.name, order.vendor, item.vendorName, item.sellerName) ?? 'N/A');
}

export function getOrderCustomer(order: OrderRecord): string {
  const customer = firstValue(order.customerName, order.customer?.name, order.customer?.fullName, order.customer, order.userName, order.user?.name, order.user?.username, order.customerEmail, order.userEmail);
  const email = firstValue(order.customerEmail, order.customer?.email, order.userEmail, order.user?.email);
  if (customer && email && String(customer) !== String(email)) return `${customer} / ${email}`;
  return String(customer ?? email ?? 'N/A');
}

export function getOrderStatus(order: OrderRecord): string {
  return String(firstValue(order.orderStatus, order.status) ?? 'N/A');
}

export function getOrderTotal(order: OrderRecord): string {
  const item = getOrderItem(order);
  const value = Number(firstValue(order.totalAmount, order.total, order.amount, item.subtotal, item.price));
  return Number.isFinite(value) ? `₹${value.toLocaleString()}` : 'N/A';
}
