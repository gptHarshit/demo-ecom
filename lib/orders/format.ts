import type {
  FulfillmentStatus,
  PaymentMethod,
  PaymentStatus,
  SalesChannel,
} from "@/types/order";

export function formatINR(value: number | string, withDecimals = true): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function formatShortDate(value: string): string {
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d);
}

export function formatTime(value: string): string {
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(d);
}

export function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  return formatShortDate(value);
}

export const FULFILLMENT_LABEL: Record<FulfillmentStatus, string> = {
  pending: "Unfulfilled",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Payment pending",
  refunded: "Refunded",
  failed: "Failed",
  voided: "Voided",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
  wallet: "Wallet",
};

export const CHANNEL_LABEL: Record<SalesChannel, string> = {
  online_store: "Online Store",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  amazon: "Amazon",
  flipkart: "Flipkart",
  pos: "In-store (POS)",
};

export const FULFILLMENT_BADGE: Record<FulfillmentStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  processing: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  shipped: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  cancelled: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  returned: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

export const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  refunded: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  failed: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  voided: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
};

export const COURIERS = ["Delhivery", "Blue Dart", "Ekart", "DTDC", "Xpressbees", "India Post"];

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
