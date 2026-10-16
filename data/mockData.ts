import { Tenant, MetricCardData, SalesDataPoint, NeedsAttentionItem, Order, LowStockProduct, ActivityItem, NotificationItem } from '../types/dashboard';

export const TENANTS: Tenant[] = [
  {
    id: 'acme-store',
    name: 'Acme Store',
    plan: 'Enterprise',
    currency: '$',
  },
  {
    id: 'zenith-fashion',
    name: 'Zenith Fashion',
    plan: 'Pro',
    currency: '$',
  },
  {
    id: 'tech-pulse',
    name: 'TechPulse Digital',
    plan: 'Scale',
    currency: '$',
  },
  {
    id: 'globex-corp',
    name: 'Globex Retail',
    plan: 'Enterprise',
    currency: '$',
  },
];

export const MOCK_METRICS: MetricCardData[] = [
  {
    id: 'net-sales',
    title: 'Net Sales',
    value: '$12,480.00',
    trend: '12.4%',
    isPositive: true,
    timeframe: 'vs last 7 days',
    iconType: 'sales',
  },
  {
    id: 'orders',
    title: 'Orders',
    value: '184',
    trend: '8.2%',
    isPositive: true,
    timeframe: 'vs last 7 days',
    iconType: 'orders',
  },
  {
    id: 'customers',
    title: 'Customers',
    value: '1,248',
    trend: '6.1%',
    isPositive: true,
    timeframe: 'vs last 7 days',
    iconType: 'customers',
  },
  {
    id: 'inventory-units',
    title: 'Inventory Units',
    value: '438',
    trend: '3.6%',
    isPositive: false,
    timeframe: 'vs last 7 days',
    iconType: 'inventory',
  },
];

export const MOCK_SALES_7D: SalesDataPoint[] = [
  { date: 'Jul 22', amount: 1200, formattedAmount: '$1,200' },
  { date: 'Jul 23', amount: 3600, formattedAmount: '$3,600' },
  { date: 'Jul 24', amount: 1500, formattedAmount: '$1,500' },
  { date: 'Jul 25', amount: 3800, formattedAmount: '$3,800' },
  { date: 'Jul 26', amount: 4200, formattedAmount: '$4,200' },
  { date: 'Jul 27', amount: 3700, formattedAmount: '$3,700' },
  { date: 'Jul 28', amount: 4800, formattedAmount: '$4,800' },
];

export const MOCK_SALES_30D: SalesDataPoint[] = [
  { date: 'Week 1', amount: 18400, formattedAmount: '$18,400' },
  { date: 'Week 2', amount: 24200, formattedAmount: '$24,200' },
  { date: 'Week 3', amount: 21900, formattedAmount: '$21,900' },
  { date: 'Week 4', amount: 31500, formattedAmount: '$31,500' },
];

export const MOCK_SALES_90D: SalesDataPoint[] = [
  { date: 'May', amount: 72000, formattedAmount: '$72,000' },
  { date: 'Jun', amount: 89000, formattedAmount: '$89,000' },
  { date: 'Jul', amount: 104500, formattedAmount: '$104,500' },
];

export const MOCK_NEEDS_ATTENTION: NeedsAttentionItem[] = [
  {
    id: '1',
    title: 'Low Stock Products',
    count: 8,
    type: 'low_stock',
    color: 'amber',
  },
  {
    id: '2',
    title: 'Out of Stock Products',
    count: 3,
    type: 'out_of_stock',
    color: 'red',
  },
  {
    id: '3',
    title: 'Pending Orders',
    count: 5,
    type: 'pending_orders',
    color: 'blue',
  },
  {
    id: '4',
    title: 'Payment Failures',
    count: 2,
    type: 'payment_failures',
    color: 'purple',
  },
];

export const MOCK_RECENT_ORDERS: Order[] = [
  {
    id: 'ord-1048',
    orderNumber: '#1048',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.s@example.com',
    amount: '$124.00',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Processing',
    timeAgo: '2m ago',
    timestamp: '2024-07-28T14:30:00Z',
  },
  {
    id: 'ord-1047',
    orderNumber: '#1047',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    amount: '$89.00',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Shipped',
    timeAgo: '12m ago',
    timestamp: '2024-07-28T14:20:00Z',
  },
  {
    id: 'ord-1046',
    orderNumber: '#1046',
    customerName: 'Amit Kumar',
    customerEmail: 'amit.k@example.com',
    amount: '$210.00',
    paymentStatus: 'COD',
    fulfillmentStatus: 'Pending',
    timeAgo: '21m ago',
    timestamp: '2024-07-28T14:11:00Z',
  },
  {
    id: 'ord-1045',
    orderNumber: '#1045',
    customerName: 'Neha Verma',
    customerEmail: 'neha.v@example.com',
    amount: '$45.00',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Processing',
    timeAgo: '35m ago',
    timestamp: '2024-07-28T13:57:00Z',
  },
  {
    id: 'ord-1044',
    orderNumber: '#1044',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.s@example.com',
    amount: '$320.00',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Delivered',
    timeAgo: '1h ago',
    timestamp: '2024-07-28T13:30:00Z',
  },
];

export const MOCK_LOW_STOCK_PRODUCTS: LowStockProduct[] = [
  {
    id: 'prod-1',
    title: 'Black T-Shirt',
    sku: 'SKU: TSH-BLK-001',
    stockLeft: 4,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&auto=format&fit=crop&q=80',
    category: 'Apparel',
  },
  {
    id: 'prod-2',
    title: 'White Sneakers',
    sku: 'SKU: SNK-WHT-002',
    stockLeft: 2,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&auto=format&fit=crop&q=80',
    category: 'Footwear',
  },
  {
    id: 'prod-3',
    title: 'Hoodie - Blue',
    sku: 'SKU: HD-BLU-003',
    stockLeft: 0,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150&auto=format&fit=crop&q=80',
    category: 'Apparel',
  },
  {
    id: 'prod-4',
    title: 'Coffee Mug',
    sku: 'SKU: MUG-BLK-004',
    stockLeft: 5,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80',
    category: 'Accessories',
  },
];

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Stock adjusted',
    timeAgo: '2m ago',
    type: 'stock_adjusted',
  },
  {
    id: 'act-2',
    title: 'Order #1048 received',
    timeAgo: '5m ago',
    type: 'order_received',
  },
  {
    id: 'act-3',
    title: 'Product "Hoodie - Blue" added',
    timeAgo: '1h ago',
    type: 'product_added',
  },
  {
    id: 'act-4',
    title: 'Order #1047 shipped',
    timeAgo: '2h ago',
    type: 'order_shipped',
  },
  {
    id: 'act-5',
    title: 'Customer account created',
    timeAgo: '3h ago',
    type: 'customer_created',
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Payment Received',
    description: 'Order #1048 was paid via Stripe ($124.00)',
    timeAgo: '2m ago',
    unread: true,
    type: 'payment',
  },
  {
    id: 'notif-2',
    title: 'Out of Stock Alert',
    description: 'Hoodie - Blue has reached 0 units in main warehouse',
    timeAgo: '1h ago',
    unread: true,
    type: 'inventory',
  },
  {
    id: 'notif-3',
    title: 'New Customer Registered',
    description: 'Rahul Sharma created a new store account',
    timeAgo: '2h ago',
    unread: true,
    type: 'system',
  },
];
