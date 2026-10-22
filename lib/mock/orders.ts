// ---------------------------------------------------------------------------
// DEMO ORDERS — generation + business rules for the in-browser demo API.
//
// Orders are generated from the workspace's own demo catalog, so every line
// item points at a real product/variant (same names, SKUs and prices you see
// on the Products and Inventory pages). Customers, addresses, phone numbers
// and tracking numbers are all invented; emails use example.com.
//
// Stock rules (mirrors a typical commerce backend):
//   placed / processing  -> quantity is RESERVED  (Available drops)
//   shipped / delivered  -> quantity is DEDUCTED  (On hand drops)
//   cancelled            -> reservation RELEASED
//   returned             -> quantity RESTOCKED
// ---------------------------------------------------------------------------

import type {
  FulfillmentStatus,
  OrderAddress,
  OrderCustomer,
  OrderEvent,
  OrderEventType,
  OrderLineItem,
  OrderResponse,
  OrderShipment,
  PaymentMethod,
  PaymentStatus,
  SalesChannel,
} from "@/types/order";
import { COURIERS, PAYMENT_METHOD_LABEL } from "@/lib/orders/format";
import { DISCOUNT_CODES, priceOrder } from "@/lib/orders/pricing";

/* ============================================================
   STRUCTURAL TYPES (subset of the server's DB shapes)
============================================================ */

export interface StockVariant {
  id: string;
  sku: string;
  price: string;
  on_hand: number;
  reserved: number;
  version: number;
  inventory_updated_at: string;
  option_value_ids: string[];
  is_default: boolean;
}

export interface StockProduct {
  id: string;
  name: string;
  sku: string;
  status: "draft" | "active" | "archived";
  variants: StockVariant[];
}

export type StockState = "reserved" | "deducted" | "released";

export interface DbOrder extends Omit<OrderResponse, "events"> {
  events: OrderEvent[];
  stock_state: StockState;
}

export interface OrderStore {
  products: StockProduct[];
  orders?: DbOrder[];
  order_seq?: number;
  order_prefix?: string;
}

/* ============================================================
   DEMO PEOPLE & PLACES (fictional)
============================================================ */

const CUSTOMERS: Array<[string, string]> = [
  ["Priya Nair", "Kochi"],
  ["Rohan Mehta", "Mumbai"],
  ["Ananya Iyer", "Chennai"],
  ["Vikram Singh", "Jaipur"],
  ["Sneha Kulkarni", "Pune"],
  ["Arjun Reddy", "Hyderabad"],
  ["Kavya Menon", "Bengaluru"],
  ["Aditya Verma", "Lucknow"],
  ["Ishita Banerjee", "Kolkata"],
  ["Karan Malhotra", "New Delhi"],
  ["Neha Joshi", "Ahmedabad"],
  ["Siddharth Rao", "Bengaluru"],
  ["Meera Pillai", "Thiruvananthapuram"],
  ["Rahul Gupta", "Noida"],
  ["Pooja Desai", "Surat"],
  ["Aman Chauhan", "Chandigarh"],
  ["Divya Krishnan", "Coimbatore"],
  ["Nikhil Saxena", "Indore"],
  ["Tanvi Shah", "Mumbai"],
  ["Harsh Agarwal", "Gurugram"],
  ["Ritika Sharma", "New Delhi"],
  ["Manish Yadav", "Patna"],
  ["Shreya Ghosh", "Kolkata"],
  ["Varun Kapoor", "Mumbai"],
  ["Aishwarya Hegde", "Mangaluru"],
  ["Yash Patel", "Vadodara"],
  ["Nandini Das", "Bhubaneswar"],
  ["Abhishek Tiwari", "Bhopal"],
  ["Sanya Arora", "Gurugram"],
  ["Kunal Bhatt", "Ahmedabad"],
  ["Lakshmi Subramanian", "Chennai"],
  ["Gaurav Mishra", "Varanasi"],
  ["Riya Sen", "Pune"],
  ["Akash Jain", "Jaipur"],
  ["Pallavi Naidu", "Visakhapatnam"],
  ["Deepak Choudhary", "Nagpur"],
  ["Simran Kaur", "Ludhiana"],
  ["Mohit Bansal", "New Delhi"],
  ["Anjali Rawat", "Dehradun"],
  ["Sameer Khan", "Hyderabad"],
];

const CITY_INFO: Record<string, { state: string; pin: string; areas: string[] }> = {
  Kochi: { state: "Kerala", pin: "6820", areas: ["Kadavanthra", "Panampilly Nagar", "Edappally"] },
  Mumbai: { state: "Maharashtra", pin: "4000", areas: ["Andheri West", "Bandra West", "Powai", "Malad East"] },
  Chennai: { state: "Tamil Nadu", pin: "6000", areas: ["Adyar", "T. Nagar", "Velachery", "Anna Nagar"] },
  Jaipur: { state: "Rajasthan", pin: "3020", areas: ["Malviya Nagar", "Vaishali Nagar", "C-Scheme"] },
  Pune: { state: "Maharashtra", pin: "4110", areas: ["Kothrud", "Baner", "Viman Nagar", "Hinjewadi"] },
  Hyderabad: { state: "Telangana", pin: "5000", areas: ["Gachibowli", "Banjara Hills", "Kondapur"] },
  Bengaluru: { state: "Karnataka", pin: "5600", areas: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"] },
  Lucknow: { state: "Uttar Pradesh", pin: "2260", areas: ["Gomti Nagar", "Hazratganj", "Aliganj"] },
  Kolkata: { state: "West Bengal", pin: "7000", areas: ["Salt Lake", "Ballygunge", "New Town"] },
  "New Delhi": { state: "Delhi", pin: "1100", areas: ["Lajpat Nagar", "Dwarka Sector 12", "Saket", "Rajouri Garden"] },
  Ahmedabad: { state: "Gujarat", pin: "3800", areas: ["Satellite", "Navrangpura", "Bopal"] },
  Thiruvananthapuram: { state: "Kerala", pin: "6950", areas: ["Kowdiar", "Vazhuthacaud", "Pattom"] },
  Noida: { state: "Uttar Pradesh", pin: "2013", areas: ["Sector 62", "Sector 50", "Sector 137"] },
  Surat: { state: "Gujarat", pin: "3950", areas: ["Adajan", "Vesu", "Piplod"] },
  Chandigarh: { state: "Chandigarh", pin: "1600", areas: ["Sector 35", "Sector 22", "Sector 8"] },
  Coimbatore: { state: "Tamil Nadu", pin: "6410", areas: ["RS Puram", "Peelamedu", "Saibaba Colony"] },
  Indore: { state: "Madhya Pradesh", pin: "4520", areas: ["Vijay Nagar", "Palasia", "Bhawarkua"] },
  Gurugram: { state: "Haryana", pin: "1220", areas: ["DLF Phase 3", "Sector 56", "Sohna Road"] },
  Patna: { state: "Bihar", pin: "8000", areas: ["Boring Road", "Kankarbagh", "Patliputra Colony"] },
  Mangaluru: { state: "Karnataka", pin: "5750", areas: ["Kadri", "Bejai", "Kankanady"] },
  Vadodara: { state: "Gujarat", pin: "3900", areas: ["Alkapuri", "Gotri", "Akota"] },
  Bhubaneswar: { state: "Odisha", pin: "7510", areas: ["Saheed Nagar", "Patia", "Jaydev Vihar"] },
  Bhopal: { state: "Madhya Pradesh", pin: "4620", areas: ["Arera Colony", "MP Nagar", "Kolar Road"] },
  Varanasi: { state: "Uttar Pradesh", pin: "2210", areas: ["Lanka", "Sigra", "Mahmoorganj"] },
  Visakhapatnam: { state: "Andhra Pradesh", pin: "5300", areas: ["MVP Colony", "Seethammadhara", "Gajuwaka"] },
  Nagpur: { state: "Maharashtra", pin: "4400", areas: ["Dharampeth", "Sitabuldi", "Manish Nagar"] },
  Ludhiana: { state: "Punjab", pin: "1410", areas: ["Model Town", "Sarabha Nagar", "BRS Nagar"] },
  Dehradun: { state: "Uttarakhand", pin: "2480", areas: ["Rajpur Road", "Vasant Vihar", "Ballupur"] },
};

const BUILDINGS = ["Sunrise Apartments", "Green Valley", "Shanti Niketan", "Lakeview Residency", "Palm Grove", "Silver Oak Towers", "Krishna Enclave", "Orchid Heights"];

const NOTES = [
  "Please deliver after 6 PM.",
  "Gift wrap please — it's a birthday present.",
  "Call before delivery, gate is locked.",
  "Leave with the security guard if not home.",
  "Exchange size if it doesn't fit?",
];

const CANCEL_REASONS = [
  "Customer changed their mind",
  "Ordered the wrong size",
  "Delivery date too late for customer",
  "Duplicate order",
];

const RETURN_REASONS = ["Size didn't fit", "Colour different from photos", "Received a damaged item"];

/* ============================================================
   RANDOMNESS (seeded so a workspace's demo orders look natural)
============================================================ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Rng = () => number;

function pick<T>(rng: Rng, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function weighted<T>(rng: Rng, entries: Array<[T, number]>): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of entries) {
    r -= w;
    if (r <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

function digits(rng: Rng, n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(rng() * 10);
  return s;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const money = (n: number | string) => Number(n).toFixed(2);
const HOUR = 3600 * 1000;

/* ============================================================
   HELPERS
============================================================ */

export function orderPrefix(businessName: string): string {
  const letters = businessName
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return letters.length === 2 ? letters : (businessName.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "OR").padEnd(2, "X");
}

export function trackingNumber(rng: Rng, courier: string): string {
  switch (courier) {
    case "Delhivery":
      return digits(rng, 14);
    case "Blue Dart":
      return digits(rng, 11);
    case "Ekart":
      return `FMPP${digits(rng, 10)}`;
    case "DTDC":
      return `D${digits(rng, 9)}`;
    case "Xpressbees":
      return digits(rng, 15);
    default:
      return `EK${digits(rng, 9)}IN`;
  }
}

function event(type: OrderEventType, message: string, at: number | string): OrderEvent {
  return { id: uid(), type, message, at: typeof at === "number" ? new Date(at).toISOString() : at };
}

function emailFor(name: string, rng: Rng): string {
  const [first, last = ""] = name.toLowerCase().split(" ");
  const style = Math.floor(rng() * 3);
  const local = style === 0 ? `${first}.${last}` : style === 1 ? `${first}${last.slice(0, 1)}${digits(rng, 2)}` : `${first}_${last}`;
  return `${local}@example.com`;
}

function addressFor(city: string, rng: Rng): OrderAddress {
  const info = CITY_INFO[city];
  return {
    line1: `${Math.floor(rng() * 400) + 1}, ${pick(rng, BUILDINGS)}`,
    line2: pick(rng, info.areas),
    city,
    state: info.state,
    pincode: `${info.pin}${digits(rng, 2)}`,
  };
}

export function variantTitleFrom(
  v: StockVariant,
  resolveValue: (valueId: string) => string | undefined,
): string | undefined {
  if (v.is_default || v.option_value_ids.length === 0) return undefined;
  const parts = v.option_value_ids.map(resolveValue).filter(Boolean);
  return parts.length ? parts.join(" / ") : undefined;
}

/* ============================================================
   DEMO ORDER GENERATION
============================================================ */

export function generateDemoOrders(
  store: OrderStore,
  opts: { businessId: string; businessName: string; resolveValue: (id: string) => string | undefined },
): void {
  const rng = mulberry32(hashString(opts.businessId));
  const now = Date.now();
  const prefix = orderPrefix(opts.businessName);

  const sellable = store.products.filter((p) => p.status === "active");
  if (sellable.length === 0) {
    store.orders = [];
    store.order_seq = 1001;
    store.order_prefix = prefix;
    return;
  }

  // Reserve stock for open orders as we go, so seeded data never oversells.
  const openNeed = new Map<string, number>();
  const availableFor = (v: StockVariant) => v.on_hand - (openNeed.get(v.id) ?? 0);

  // A few repeat customers, like a real store.
  const customerPool = CUSTOMERS.map(([name, city]) => ({
    customer: {
      name,
      email: emailFor(name, rng),
      phone: `+91 ${pick(rng, ["9", "8", "7"])}${digits(rng, 4)} ${digits(rng, 5)}`,
    } as OrderCustomer,
    address: addressFor(city, rng),
  }));

  const COUNT = 210;
  const drafts: DbOrder[] = [];

  for (let i = 0; i < COUNT; i++) {
    // More orders recently, a long tail going back ~90 days.
    // A steady flow over ~90 days (slight upward trend), plus a handful of
    // orders from the last day or so that still need to be fulfilled.
    const ageHours = i < 14 ? rng() * 30 + 0.4 : Math.pow(rng(), 1.12) * 90 * 24 + 0.4;
    let placedAt = now - ageHours * HOUR;
    const hour = new Date(placedAt).getHours();
    if (hour < 8) placedAt += (8 - hour + rng() * 3) * HOUR; // few orders before 8 AM
    if (placedAt > now - 0.3 * HOUR) placedAt = now - (0.3 + rng()) * HOUR;
    const ageDays = (now - placedAt) / (24 * HOUR);

    const channel = weighted<SalesChannel>(rng, [
      ["online_store", 45],
      ["instagram", 17],
      ["whatsapp", 10],
      ["amazon", 12],
      ["flipkart", 10],
      ["pos", 6],
    ]);

    let status: FulfillmentStatus;
    if (channel === "pos") status = "delivered";
    else if (ageDays < 1) status = weighted(rng, [["pending", 55], ["processing", 40], ["cancelled", 5]]);
    else if (ageDays < 3) status = weighted(rng, [["processing", 30], ["shipped", 60], ["cancelled", 10]]);
    else if (ageDays < 6) status = weighted(rng, [["shipped", 45], ["delivered", 48], ["cancelled", 7]]);
    else status = weighted(rng, [["delivered", 86], ["cancelled", 7], ["returned", 7]]);

    const isOpen = status === "pending" || status === "processing";

    // Line items
    const itemCount = weighted(rng, [[1, 60], [2, 28], [3, 12]]);
    const items: OrderLineItem[] = [];
    const usedVariants = new Set<string>();
    for (let k = 0; k < itemCount * 4 && items.length < itemCount; k++) {
      const product = pick(rng, sellable);
      const variant = pick(rng, product.variants);
      if (!variant || usedVariants.has(variant.id)) continue;
      const qty = weighted(rng, [[1, 76], [2, 19], [3, 5]]);
      if (isOpen && availableFor(variant) < qty) continue;
      usedVariants.add(variant.id);
      if (isOpen) openNeed.set(variant.id, (openNeed.get(variant.id) ?? 0) + qty);
      items.push({
        id: uid(),
        product_id: product.id,
        variant_id: variant.id,
        name: product.name,
        sku: variant.sku,
        variant_title: variantTitleFrom(variant, opts.resolveValue),
        unit_price: variant.price,
        quantity: qty,
        line_total: money(Number(variant.price) * qty),
      });
    }
    if (items.length === 0) continue;

    const who = rng() < 0.3 ? customerPool[Math.floor(rng() * 8)] : pick(rng, customerPool);

    const method: PaymentMethod =
      channel === "pos"
        ? weighted(rng, [["upi", 60], ["card", 40]])
        : channel === "amazon" || channel === "flipkart"
          ? weighted(rng, [["upi", 45], ["card", 25], ["cod", 30]])
          : weighted(rng, [["upi", 42], ["cod", 25], ["card", 18], ["netbanking", 7], ["wallet", 8]]);

    let payment: PaymentStatus;
    if (method === "cod") {
      payment = status === "delivered" ? "paid" : status === "returned" ? "refunded" : status === "cancelled" ? "voided" : "pending";
    } else {
      payment = status === "cancelled" || status === "returned" ? "refunded" : "paid";
      if (status === "pending" && rng() < 0.12) payment = "failed";
    }

    const discountCode =
      channel !== "amazon" && channel !== "flipkart" && rng() < 0.22 ? pick(rng, DISCOUNT_CODES).code : undefined;
    let pricing = priceOrder(
      items.map((it) => ({ unitPrice: Number(it.unit_price), quantity: it.quantity })),
      { discountCode, inStore: channel === "pos" },
    );
    const appliedCode = discountCode && !pricing.discountError ? discountCode : undefined;
    if (discountCode && pricing.discountError) {
      pricing = priceOrder(
        items.map((it) => ({ unitPrice: Number(it.unit_price), quantity: it.quantity })),
        { inStore: channel === "pos" },
      );
    }

    // Timeline
    const t0 = placedAt;
    const events: OrderEvent[] = [];
    const methodLabel = PAYMENT_METHOD_LABEL[method];
    events.push(event("placed", channel === "pos" ? "Order created at the store counter" : `Order placed via ${channelName(channel)}`, t0));
    if (method !== "cod" && payment !== "failed") {
      events.push(event("payment", `Payment of ₹${pricing.total.toLocaleString("en-IN")} received via ${methodLabel}`, t0 + 60 * 1000));
    }
    if (payment === "failed") {
      events.push(event("payment", `${methodLabel} payment failed — waiting for the customer to retry`, t0 + 2 * 60 * 1000));
    }

    let shipment: OrderShipment | undefined;
    let cancelReason: string | undefined;
    let updatedAt = t0;
    const confirmAt = t0 + (0.5 + rng() * 2) * HOUR;
    const packAt = confirmAt + (2 + rng() * 10) * HOUR;
    const shipAt = packAt + (2 + rng() * 8) * HOUR;
    const deliverAt = shipAt + (1.5 + rng() * 3) * 24 * HOUR;
    const clamp = (t: number) => Math.min(t, now - 5 * 60 * 1000);

    if (channel === "pos") {
      events.push(event("delivered", "Handed over to the customer in store", t0 + 2 * 60 * 1000));
      updatedAt = t0 + 2 * 60 * 1000;
    } else if (status !== "pending") {
      if (status === "cancelled") {
        const at = clamp(t0 + (0.3 + rng() * 6) * HOUR);
        cancelReason = pick(rng, CANCEL_REASONS);
        events.push(event("cancelled", `Order cancelled — ${cancelReason}`, at));
        if (payment === "refunded") events.push(event("refunded", `Refund of ₹${pricing.total.toLocaleString("en-IN")} issued to ${methodLabel}`, at + 20 * 60 * 1000));
        updatedAt = at;
      } else {
        events.push(event("confirmed", "Order confirmed", clamp(confirmAt)));
        updatedAt = clamp(confirmAt);
        if (status !== "processing" || rng() < 0.5) {
          events.push(event("packed", "Items packed at Main Warehouse", clamp(packAt)));
          updatedAt = clamp(packAt);
        }
        if (status === "shipped" || status === "delivered" || status === "returned") {
          const courier = pick(rng, COURIERS);
          const at = clamp(shipAt);
          shipment = { courier, tracking_number: trackingNumber(rng, courier), shipped_at: new Date(at).toISOString() };
          events.push(event("shipped", `Shipped via ${courier} · AWB ${shipment.tracking_number}`, at));
          updatedAt = at;
          if (status === "shipped" && now - at > 30 * HOUR) {
            events.push(event("out_for_delivery", "Out for delivery", clamp(at + 26 * HOUR)));
            updatedAt = clamp(at + 26 * HOUR);
          }
        }
        if (status === "delivered" || status === "returned") {
          const at = clamp(deliverAt);
          events.push(event("delivered", "Delivered to the customer", at));
          if (method === "cod") events.push(event("payment", `Cash of ₹${pricing.total.toLocaleString("en-IN")} collected on delivery`, at + 60 * 1000));
          updatedAt = at;
        }
        if (status === "returned") {
          const at = clamp(deliverAt + (2 + rng() * 4) * 24 * HOUR);
          events.push(event("returned", `Return received — ${pick(rng, RETURN_REASONS)}. Items restocked.`, at));
          events.push(event("refunded", `Refund of ₹${pricing.total.toLocaleString("en-IN")} issued`, at + HOUR));
          updatedAt = at + HOUR;
        }
      }
    }

    const draft: DbOrder = {
      id: uid(),
      order_number: "",
      customer: who.customer,
      shipping_address: channel === "pos" ? storeAddress() : who.address,
      channel,
      payment_method: method,
      payment_status: payment,
      fulfillment_status: status,
      items,
      subtotal: money(pricing.subtotal),
      discount: money(pricing.discount),
      discount_code: appliedCode,
      shipping_fee: money(pricing.shipping),
      tax_included: money(pricing.taxIncluded),
      total: money(pricing.total),
      shipment,
      note: channel !== "pos" && rng() < 0.12 ? pick(rng, NOTES) : undefined,
      cancel_reason: cancelReason,
      events: events.sort((a, b) => a.at.localeCompare(b.at)),
      created_at: new Date(t0).toISOString(),
      updated_at: new Date(Math.min(updatedAt, now)).toISOString(),
      stock_state: isOpen ? "reserved" : status === "cancelled" ? "released" : "deducted",
    };
    drafts.push(draft);
  }

  // Number orders in the order they were placed.
  drafts.sort((a, b) => a.created_at.localeCompare(b.created_at));
  let seq = 1001;
  for (const o of drafts) o.order_number = `#${prefix}-${seq++}`;

  // Reserved stock now reflects the open orders exactly.
  for (const p of store.products) {
    for (const v of p.variants) {
      v.reserved = Math.min(v.on_hand, openNeed.get(v.id) ?? 0);
    }
  }

  store.orders = drafts;
  store.order_seq = seq;
  store.order_prefix = prefix;
}

function channelName(c: SalesChannel): string {
  return {
    online_store: "Online Store",
    instagram: "Instagram Shop",
    whatsapp: "WhatsApp",
    amazon: "Amazon",
    flipkart: "Flipkart",
    pos: "store counter",
  }[c];
}

export function storeAddress(): OrderAddress {
  return { line1: "Store pickup — Main Warehouse", line2: "Counter sale", city: "Bengaluru", state: "Karnataka", pincode: "560038" };
}

/* ============================================================
   STOCK OPERATIONS
============================================================ */

function findVariant(store: OrderStore, item: OrderLineItem): StockVariant | undefined {
  const p = store.products.find((x) => x.id === item.product_id);
  return p?.variants.find((v) => v.id === item.variant_id);
}

function touch(v: StockVariant) {
  v.version += 1;
  v.inventory_updated_at = new Date().toISOString();
}

/** reserved -> deducted (on ship / deliver). */
export function deductStock(store: OrderStore, order: DbOrder): void {
  if (order.stock_state !== "reserved") return;
  for (const item of order.items) {
    const v = findVariant(store, item);
    if (!v) continue;
    v.reserved = Math.max(0, v.reserved - item.quantity);
    v.on_hand = Math.max(0, v.on_hand - item.quantity);
    touch(v);
  }
  order.stock_state = "deducted";
}

/** reserved -> released (on cancel). */
export function releaseStock(store: OrderStore, order: DbOrder): void {
  if (order.stock_state !== "reserved") return;
  for (const item of order.items) {
    const v = findVariant(store, item);
    if (!v) continue;
    v.reserved = Math.max(0, v.reserved - item.quantity);
    touch(v);
  }
  order.stock_state = "released";
}

/** deducted -> released (on return: goods come back to the shelf). */
export function restock(store: OrderStore, order: DbOrder): void {
  if (order.stock_state !== "deducted") return;
  for (const item of order.items) {
    const v = findVariant(store, item);
    if (!v) continue;
    v.on_hand += item.quantity;
    touch(v);
  }
  order.stock_state = "released";
}

export function newEvent(type: OrderEventType, message: string): OrderEvent {
  return event(type, message, Date.now());
}

export function serializeOrder(o: DbOrder): OrderResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stock_state, ...rest } = o;
  return { ...rest, events: [...o.events].sort((a, b) => a.at.localeCompare(b.at)) };
}

export const randomTracking = (courier: string) => trackingNumber(Math.random, courier);
