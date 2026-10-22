"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  PackageCheck,
  Phone,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Send,
  ShoppingBag,
  StickyNote,
  Truck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  addOrderNote,
  cancelOrder,
  getOrder,
  getOrders,
  markOrderPaid,
  updateFulfillment,
} from "@/lib/api/order.api";
import { ApiError } from "@/lib/api/api-error";
import {
  CHANNEL_LABEL,
  COURIERS,
  PAYMENT_METHOD_LABEL,
  formatDateTime,
  formatINR,
  initials,
} from "@/lib/orders/format";
import type { OrderEventType, OrderResponse } from "@/types/order";
import { useUser } from "@/context/UserContext";
import { FulfillmentBadge, PaymentBadge } from "./OrderBadges";

const CANCEL_REASONS = [
  "Customer changed their mind",
  "Ordered the wrong size",
  "Item out of stock",
  "Payment not received",
  "Duplicate order",
  "Suspected fraud",
];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20";

type Dialog = null | "ship" | "cancel" | "return";

export default function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { business } = useUser();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [courier, setCourier] = useState(COURIERS[0]);
  const [tracking, setTracking] = useState("");
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [o, all] = await Promise.all([getOrder(orderId), getOrders()]);
      setOrder(o);
      setCustomerOrders(
        all.orders.filter(
          (x) =>
            x.customer.phone.replace(/\D/g, "").slice(-10) === o.customer.phone.replace(/\D/g, "").slice(-10),
        ),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to load order.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<OrderResponse>) => {
    try {
      setBusy(key);
      setActionError("");
      const updated = await fn();
      setOrder(updated);
      setDialog(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- states ---------------- */

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-2 py-4 lg:px-4">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-card">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#0284c7]" />
            <p className="text-sm font-semibold text-foreground">Loading order…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-2 py-4 lg:px-4">
        <BackLink />
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h2 className="text-sm font-semibold text-foreground">Unable to load order</h2>
          <p className="mt-1 text-xs text-muted-text">{error || "Order not found."}</p>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const fs = order.fulfillment_status;
  const ps = order.payment_status;
  const units = order.items.reduce((s, i) => s + i.quantity, 0);
  const isClosed = fs === "cancelled" || fs === "returned";
  const lifetimeSpend = customerOrders
    .filter((o) => o.fulfillment_status !== "cancelled" && o.fulfillment_status !== "returned")
    .reduce((s, o) => s + Number(o.total), 0);

  const copyAddress = async () => {
    const a = order.shipping_address;
    const text = [order.customer.name, a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`, order.customer.phone]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available (e.g. insecure context) — ignore.
    }
  };

  /* ---------------- render ---------------- */

  return (
    <div className="mx-auto w-full max-w-[1400px] px-2 py-4 lg:px-4">
      <BackLink />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0284c7]/10 text-[#0284c7]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{order.order_number}</h1>
              <PaymentBadge status={ps} />
              <FulfillmentBadge status={fs} />
            </div>
            <p className="text-sm text-muted-text">
              {formatDateTime(order.created_at)} · {CHANNEL_LABEL[order.channel]} · {units} item{units === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={() => openInvoice(order, business?.name ?? "Your Store")} icon={<FileText className="h-4 w-4" />}>
            Invoice
          </ActionButton>
          {(ps === "pending" || ps === "failed") && !isClosed && (
            <ActionButton
              onClick={() => run("paid", () => markOrderPaid(order.id))}
              busy={busy === "paid"}
              icon={<Wallet className="h-4 w-4" />}
            >
              Mark as paid
            </ActionButton>
          )}
          {(fs === "pending" || fs === "processing") && (
            <ActionButton tone="danger" onClick={() => setDialog("cancel")} icon={<Ban className="h-4 w-4" />}>
              Cancel order
            </ActionButton>
          )}
          {(fs === "shipped" || fs === "delivered") && (
            <ActionButton onClick={() => setDialog("return")} icon={<RotateCcw className="h-4 w-4" />}>
              Record return
            </ActionButton>
          )}
          {fs === "pending" && (
            <ActionButton
              primary
              onClick={() => run("processing", () => updateFulfillment(order.id, { status: "processing" }))}
              busy={busy === "processing"}
              icon={<ClipboardCheck className="h-4 w-4" />}
            >
              Confirm &amp; pack
            </ActionButton>
          )}
          {fs === "processing" && (
            <ActionButton primary onClick={() => setDialog("ship")} icon={<Truck className="h-4 w-4" />}>
              Ship order
            </ActionButton>
          )}
          {fs === "shipped" && (
            <ActionButton
              primary
              onClick={() => run("delivered", () => updateFulfillment(order.id, { status: "delivered" }))}
              busy={busy === "delivered"}
              icon={<PackageCheck className="h-4 w-4" />}
            >
              Mark delivered
            </ActionButton>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError("")} aria-label="Dismiss">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Inline dialogs */}
      {dialog === "ship" && (
        <Panel icon={<Truck className="h-5 w-5" />} title="Ship this order" subtitle="Stock is deducted from inventory when the order ships.">
          <div className="grid gap-4 sm:grid-cols-[200px_1fr_auto] sm:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Courier</label>
              <select className={inputClass} value={courier} onChange={(e) => setCourier(e.target.value)}>
                {COURIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Tracking / AWB number</label>
              <input className={inputClass} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Leave empty to auto-generate" />
            </div>
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setDialog(null)}>Back</SecondaryButton>
              <ActionButton
                primary
                busy={busy === "ship"}
                onClick={() =>
                  run("ship", () => updateFulfillment(order.id, { status: "shipped", courier, tracking_number: tracking.trim() || undefined }))
                }
                icon={<Send className="h-4 w-4" />}
              >
                Mark as shipped
              </ActionButton>
            </div>
          </div>
        </Panel>
      )}

      {dialog === "cancel" && (
        <Panel tone="danger" icon={<Ban className="h-5 w-5" />} title={`Cancel ${order.order_number}?`} subtitle={`Reserved stock goes back to inventory.${ps === "paid" ? ` A refund of ${formatINR(order.total)} will be issued.` : ""}`}>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Reason</label>
              <select className={inputClass} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                {CANCEL_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setDialog(null)}>Keep order</SecondaryButton>
              <ActionButton tone="dangerSolid" busy={busy === "cancel"} onClick={() => run("cancel", () => cancelOrder(order.id, cancelReason))} icon={<Ban className="h-4 w-4" />}>
                Cancel order
              </ActionButton>
            </div>
          </div>
        </Panel>
      )}

      {dialog === "return" && (
        <Panel icon={<RotateCcw className="h-5 w-5" />} title="Record a return" subtitle={`All ${units} item(s) will be restocked.${ps === "paid" ? ` A refund of ${formatINR(order.total)} will be issued.` : ""}`}>
          <div className="flex justify-end gap-2">
            <SecondaryButton onClick={() => setDialog(null)}>Back</SecondaryButton>
            <ActionButton primary busy={busy === "return"} onClick={() => run("return", () => updateFulfillment(order.id, { status: "returned" }))} icon={<RotateCcw className="h-4 w-4" />}>
              Confirm return
            </ActionButton>
          </div>
        </Panel>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-5 xl:col-span-2">
          {/* Progress */}
          <ProgressTracker order={order} />

          {/* Items */}
          <Card icon={<Package className="h-5 w-5" />} title="Items" subtitle={`${order.items.length} product${order.items.length === 1 ? "" : "s"} · ${units} unit${units === 1 ? "" : "s"}`}>
            <div className="divide-y divide-border rounded-xl border border-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/products/${item.product_id}`} className="truncate text-sm font-semibold text-foreground hover:text-[#0284c7] hover:underline">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-text">
                      {item.variant_title && <span className="mr-2 rounded-md bg-background px-1.5 py-0.5 font-medium text-foreground">{item.variant_title}</span>}
                      <span className="font-mono">{item.sku}</span>
                    </p>
                  </div>
                  <p className="hidden whitespace-nowrap text-sm text-muted-text sm:block">
                    {formatINR(item.unit_price)} × {item.quantity}
                  </p>
                  <p className="w-28 whitespace-nowrap text-right text-sm font-bold text-foreground">{formatINR(item.line_total)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 ml-auto max-w-sm space-y-2 text-sm">
              <TotalRow label="Subtotal" value={formatINR(order.subtotal)} />
              {Number(order.discount) > 0 && (
                <TotalRow label={`Discount${order.discount_code ? ` (${order.discount_code})` : ""}`} value={`− ${formatINR(order.discount)}`} accent />
              )}
              <TotalRow label="Shipping" value={Number(order.shipping_fee) === 0 ? "Free" : formatINR(order.shipping_fee)} />
              <div className="border-t border-border pt-2">
                <TotalRow label="Total" value={formatINR(order.total)} bold />
              </div>
              <p className="text-right text-[11px] text-muted-text">Includes GST of {formatINR(order.tax_included)}</p>
            </div>
          </Card>

          {/* Payment */}
          <Card icon={<CreditCard className="h-5 w-5" />} title="Payment" subtitle={PAYMENT_METHOD_LABEL[order.payment_method]}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Method" value={PAYMENT_METHOD_LABEL[order.payment_method]} />
              <Info label="Status" value={<PaymentBadge status={ps} />} />
              <Info label={ps === "refunded" ? "Refunded" : ps === "paid" ? "Amount paid" : "Amount due"} value={formatINR(order.total)} />
            </div>
            {ps === "failed" && (
              <p className="mt-3 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-600 dark:text-rose-400">
                The customer&apos;s payment failed. Share a payment link or mark it as paid once received — the order can&apos;t ship until then.
              </p>
            )}
          </Card>

          {/* Timeline */}
          <Card icon={<ReceiptText className="h-5 w-5" />} title="Timeline" subtitle="Everything that has happened to this order">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                run("note", () => addOrderNote(order.id, note.trim())).then(() => setNote(""));
              }}
              className="mb-5 flex gap-2"
            >
              <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note for your team…" />
              <button
                type="submit"
                disabled={!note.trim() || busy === "note"}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0284c7] px-4 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "note" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Post
              </button>
            </form>

            <ol className="relative space-y-5 border-l border-border pl-6">
              {[...order.events].reverse().map((ev) => (
                <li key={ev.id} className="relative">
                  <span className={`absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-card ${eventStyle(ev.type).bg}`}>
                    {eventStyle(ev.type).icon}
                  </span>
                  <p className="text-sm font-medium text-foreground">{ev.message}</p>
                  <p className="mt-0.5 text-xs text-muted-text">{formatDateTime(ev.at)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Customer */}
          <Card icon={<User className="h-5 w-5" />} title="Customer">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0284c7]/10 text-sm font-bold text-[#0284c7]">
                {initials(order.customer.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{order.customer.name}</p>
                <p className="text-xs text-muted-text">
                  {customerOrders.length} order{customerOrders.length === 1 ? "" : "s"} · {formatINR(lifetimeSpend, false)} spent
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              {order.customer.email ? (
                <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2.5 text-[#0284c7] hover:underline">
                  <Mail className="h-4 w-4 shrink-0 text-muted-text" />
                  <span className="truncate">{order.customer.email}</span>
                </a>
              ) : (
                <p className="flex items-center gap-2.5 text-muted-text">
                  <Mail className="h-4 w-4 shrink-0" /> No email
                </p>
              )}
              <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-foreground hover:text-[#0284c7]">
                <Phone className="h-4 w-4 shrink-0 text-muted-text" />
                {order.customer.phone}
              </a>
            </div>
            {customerOrders.length > 1 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-text">Other orders</p>
                <div className="space-y-1.5">
                  {customerOrders
                    .filter((o) => o.id !== order.id)
                    .slice(0, 4)
                    .map((o) => (
                      <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-background">
                        <span className="font-semibold text-[#0284c7]">{o.order_number}</span>
                        <span className="text-muted-text">{formatINR(o.total, false)}</span>
                        <FulfillmentBadge status={o.fulfillment_status} />
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </Card>

          {/* Address */}
          <Card
            icon={<MapPin className="h-5 w-5" />}
            title={order.channel === "pos" ? "Pickup" : "Shipping address"}
            action={
              order.channel !== "pos" && (
                <button type="button" onClick={copyAddress} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-text hover:text-foreground">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )
            }
          >
            <address className="text-sm not-italic leading-6 text-foreground">
              {order.customer.name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2 && (
                <>
                  <br />
                  {order.shipping_address.line2}
                </>
              )}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
              <br />
              India
            </address>
          </Card>

          {/* Shipment */}
          {order.shipment && (
            <Card icon={<Truck className="h-5 w-5" />} title="Shipment">
              <div className="space-y-3">
                <Info label="Courier" value={order.shipment.courier} />
                <Info label="AWB / tracking number" value={<span className="font-mono">{order.shipment.tracking_number}</span>} />
                <Info label="Shipped on" value={formatDateTime(order.shipment.shipped_at)} />
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card icon={<StickyNote className="h-5 w-5" />} title="Notes">
            {order.note ? (
              <p className="rounded-xl bg-amber-500/10 px-3.5 py-3 text-sm text-foreground">{order.note}</p>
            ) : (
              <p className="text-sm text-muted-text">No notes for this order.</p>
            )}
            {order.cancel_reason && (
              <p className="mt-3 text-xs text-muted-text">
                <span className="font-semibold text-foreground">Cancellation reason:</span> {order.cancel_reason}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PIECES
============================================================ */

function BackLink() {
  return (
    <Link href="/dashboard/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-text transition-colors hover:text-foreground">
      <ArrowLeft className="h-4 w-4" />
      Back to orders
    </Link>
  );
}

function Card({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">{icon}</div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-text">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Panel({
  icon,
  title,
  subtitle,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone?: "danger";
  children: React.ReactNode;
}) {
  return (
    <div className={`mb-5 rounded-2xl border p-5 ${tone === "danger" ? "border-rose-500/30 bg-rose-500/5" : "border-[#0284c7]/30 bg-[#0284c7]/5"}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === "danger" ? "bg-rose-500/10 text-rose-500" : "bg-[#0284c7]/10 text-[#0284c7]"}`}>{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-text">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-text">{label}</p>
      <div className="mt-1.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function TotalRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-foreground" : "text-muted-text"}>{label}</span>
      <span className={`${bold ? "text-base font-bold" : "font-semibold"} ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
  busy,
  primary,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  busy?: boolean;
  primary?: boolean;
  tone?: "danger" | "dangerSolid";
}) {
  const cls = primary
    ? "bg-[#0284c7] text-white hover:bg-sky-600 border-transparent shadow-sm"
    : tone === "danger"
      ? "border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
      : tone === "dangerSolid"
        ? "border-transparent bg-red-500 text-white hover:bg-red-600"
        : "border-border bg-card text-foreground hover:bg-background";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${cls}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background">
      {children}
    </button>
  );
}

function ProgressTracker({ order }: { order: OrderResponse }) {
  const fs = order.fulfillment_status;

  if (fs === "cancelled" || fs === "returned") {
    const ev = [...order.events].reverse().find((e) => e.type === fs);
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${fs === "cancelled" ? "bg-slate-500/10 text-slate-500" : "bg-rose-500/10 text-rose-500"}`}>
          {fs === "cancelled" ? <Ban className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{fs === "cancelled" ? "This order was cancelled" : "This order was returned"}</p>
          <p className="text-xs text-muted-text">{ev ? `${ev.message} · ${formatDateTime(ev.at)}` : ""}</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "placed", label: "Placed", icon: ShoppingBag },
    { key: "processing", label: "Packed", icon: ClipboardCheck },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: PackageCheck },
  ];
  const reached = { pending: 0, processing: 1, shipped: 2, delivered: 3 }[fs as "pending" | "processing" | "shipped" | "delivered"];
  const when = (type: OrderEventType) => order.events.find((e) => e.type === type)?.at;
  const times = [order.created_at, when("packed") ?? when("confirmed"), when("shipped"), when("delivered")];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start">
        {steps.map((s, i) => {
          const done = i <= reached;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex flex-1 items-start last:flex-none">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    done ? "border-[#0284c7] bg-[#0284c7] text-white" : "border-border bg-background text-muted-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`mt-2 text-xs font-semibold ${done ? "text-foreground" : "text-muted-text"}`}>{s.label}</p>
                <p className="mt-0.5 h-4 text-[10px] text-muted-text">{done && times[i] ? formatDateTime(times[i]).replace(/,? \d{4}/, "") : ""}</p>
              </div>
              {i < steps.length - 1 && <div className={`mx-2 mt-5 h-0.5 flex-1 rounded-full ${i < reached ? "bg-[#0284c7]" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function eventStyle(type: OrderEventType): { bg: string; icon: React.ReactNode } {
  const ic = "h-3 w-3";
  switch (type) {
    case "placed":
      return { bg: "bg-[#0284c7] text-white", icon: <ShoppingBag className={ic} /> };
    case "payment":
      return { bg: "bg-emerald-500 text-white", icon: <Wallet className={ic} /> };
    case "confirmed":
    case "packed":
      return { bg: "bg-violet-500 text-white", icon: <ClipboardCheck className={ic} /> };
    case "shipped":
    case "out_for_delivery":
      return { bg: "bg-sky-500 text-white", icon: <Truck className={ic} /> };
    case "delivered":
      return { bg: "bg-emerald-500 text-white", icon: <CheckCircle2 className={ic} /> };
    case "cancelled":
      return { bg: "bg-slate-500 text-white", icon: <Ban className={ic} /> };
    case "returned":
    case "refunded":
      return { bg: "bg-rose-500 text-white", icon: <RotateCcw className={ic} /> };
    case "note":
      return { bg: "bg-amber-500 text-white", icon: <MessageSquare className={ic} /> };
    default:
      return { bg: "bg-border text-muted-text", icon: <Circle className={ic} /> };
  }
}

/* ============================================================
   PRINTABLE INVOICE (opens in a new tab)
============================================================ */

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function openInvoice(order: OrderResponse, storeName: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const a = order.shipping_address;
  const rows = order.items
    .map(
      (i, n) => `<tr><td>${n + 1}</td><td><strong>${esc(i.name)}</strong>${i.variant_title ? `<br><span class="muted">${esc(i.variant_title)}</span>` : ""}<br><span class="muted mono">${esc(i.sku)}</span></td><td class="r">${i.quantity}</td><td class="r">${formatINR(i.unit_price)}</td><td class="r">${formatINR(i.line_total)}</td></tr>`,
    )
    .join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(order.order_number)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#0f172a;margin:40px;font-size:13px}
h1{font-size:22px;margin:0} .muted{color:#64748b} .mono{font-family:ui-monospace,monospace;font-size:11px}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0284c7;padding-bottom:16px;margin-bottom:20px}
.grid{display:flex;gap:40px;margin-bottom:24px} .grid div{flex:1}
h3{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0 0 6px}
table{width:100%;border-collapse:collapse} th{text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;padding:8px}
td{padding:10px 8px;border-bottom:1px solid #f1f5f9;vertical-align:top} .r{text-align:right}
.totals{margin-left:auto;width:280px;margin-top:16px} .totals div{display:flex;justify-content:space-between;padding:4px 0}
.grand{border-top:1px solid #e2e8f0;margin-top:6px;padding-top:8px!important;font-size:16px;font-weight:700}
.foot{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center}
.btn{position:fixed;top:16px;right:16px;background:#0284c7;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:600;cursor:pointer}
@media print{.btn{display:none}body{margin:20px}}
</style></head><body>
<button class="btn" onclick="window.print()">Print / Save as PDF</button>
<div class="top"><div><h1>${esc(storeName)}</h1><div class="muted">Tax Invoice</div></div>
<div style="text-align:right"><div style="font-size:16px;font-weight:700">${esc(order.order_number)}</div><div class="muted">${esc(formatDateTime(order.created_at))}</div><div class="muted">${esc(PAYMENT_METHOD_LABEL[order.payment_method])} · ${esc(order.payment_status.toUpperCase())}</div></div></div>
<div class="grid"><div><h3>Bill to / Ship to</h3><strong>${esc(order.customer.name)}</strong><br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ""}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.pincode)}<br>${esc(order.customer.phone)}${order.customer.email ? `<br>${esc(order.customer.email)}` : ""}</div>
<div><h3>Order details</h3>Channel: ${esc(CHANNEL_LABEL[order.channel])}<br>${order.shipment ? `Courier: ${esc(order.shipment.courier)}<br>AWB: <span class="mono">${esc(order.shipment.tracking_number)}</span>` : ""}</div></div>
<table><thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totals"><div><span class="muted">Subtotal</span><span>${formatINR(order.subtotal)}</span></div>
${Number(order.discount) > 0 ? `<div><span class="muted">Discount${order.discount_code ? ` (${esc(order.discount_code)})` : ""}</span><span>− ${formatINR(order.discount)}</span></div>` : ""}
<div><span class="muted">Shipping</span><span>${Number(order.shipping_fee) === 0 ? "Free" : formatINR(order.shipping_fee)}</span></div>
<div class="grand"><span>Total</span><span>${formatINR(order.total)}</span></div>
<div class="muted" style="font-size:11px">Includes GST of ${formatINR(order.tax_included)}</div></div>
<div class="foot">This is a demo invoice generated by MyLeadKart. Thank you for shopping with ${esc(storeName)}!</div>
</body></html>`);
  w.document.close();
}
