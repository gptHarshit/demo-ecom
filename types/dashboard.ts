export type Theme = 'light' | 'dark';

export interface Tenant {
  id: string;
  name: string;
  logoUrl?: string;
  plan: string;
  currency: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  timeframe: string;
  iconType: 'sales' | 'orders' | 'customers' | 'inventory';
}

export interface SalesDataPoint {
  date: string;
  amount: number;
  formattedAmount: string;
}

export interface NeedsAttentionItem {
  id: string;
  title: string;
  count: number;
  type: 'low_stock' | 'out_of_stock' | 'pending_orders' | 'payment_failures';
  color: 'amber' | 'red' | 'blue' | 'purple';
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  paymentStatus: 'Paid' | 'COD' | 'Pending' | 'Failed';
  fulfillmentStatus: 'Processing' | 'Shipped' | 'Pending' | 'Delivered' | 'Cancelled';
  timeAgo: string;
  timestamp: string;
}

export interface LowStockProduct {
  id: string;
  title: string;
  sku: string;
  stockLeft: number;
  imageUrl: string;
  category: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  timeAgo: string;
  type: 'stock_adjusted' | 'order_received' | 'product_added' | 'order_shipped' | 'customer_created';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  type: 'order' | 'inventory' | 'payment' | 'system';
}
