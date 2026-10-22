// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type FulfillmentStatus =
  | "pending" // placed, not yet packed
  | "processing" // confirmed and being packed
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

// "voided" = a cash-on-delivery order that was cancelled before any money moved.
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed" | "voided";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod" | "wallet";

export type SalesChannel =
  | "online_store"
  | "instagram"
  | "whatsapp"
  | "amazon"
  | "flipkart"
  | "pos";

export interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  name: string;
  sku: string;
  variant_title?: string; // e.g. "M / Black"
  unit_price: string;
  quantity: number;
  line_total: string;
}

export type OrderEventType =
  | "placed"
  | "payment"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "note";

export interface OrderEvent {
  id: string;
  type: OrderEventType;
  message: string;
  at: string;
}

export interface OrderShipment {
  courier: string;
  tracking_number: string;
  shipped_at: string;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  customer: OrderCustomer;
  shipping_address: OrderAddress;
  channel: SalesChannel;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  items: OrderLineItem[];
  subtotal: string;
  discount: string;
  discount_code?: string;
  shipping_fee: string;
  tax_included: string;
  total: string;
  shipment?: OrderShipment;
  note?: string;
  cancel_reason?: string;
  events: OrderEvent[];
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  total: number;
}

export interface CreateOrderItemInput {
  product_id: string;
  variant_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customer: OrderCustomer;
  shipping_address: OrderAddress;
  channel: SalesChannel;
  payment_method: PaymentMethod;
  mark_as_paid: boolean;
  discount_code?: string;
  note?: string;
  items: CreateOrderItemInput[];
}

export interface UpdateFulfillmentRequest {
  status: Exclude<FulfillmentStatus, "cancelled">;
  courier?: string;
  tracking_number?: string;
}
