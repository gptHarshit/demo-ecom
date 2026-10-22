"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Minus, Package, Plus, Search, ShoppingCart, Tag, Trash2, X } from "lucide-react";

import { getProducts, listVariants } from "@/lib/api/product.api";
import { createOrder } from "@/lib/api/order.api";
import { ApiError } from "@/lib/api/api-error";
import { CHANNEL_LABEL, PAYMENT_METHOD_LABEL, formatINR } from "@/lib/orders/format";
import { DISCOUNT_CODES, FREE_SHIPPING_MIN, priceOrder } from "@/lib/orders/pricing";
import type { ProductResponse, VariantResponse } from "@/types/product";
import type { OrderResponse, PaymentMethod, SalesChannel } from "@/types/order";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (order: OrderResponse) => void;
}

interface CartLine {
  key: string;
  product: ProductResponse;
  variants: VariantResponse[] | null; // null while loading
  variantId: string;
  quantity: number;
}

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-xs font-semibold text-foreground";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  channel: "online_store" as SalesChannel,
  paymentMethod: "upi" as PaymentMethod,
  markAsPaid: true,
  discountCode: "",
  note: "",
};

function variantLabel(v: VariantResponse): string {
  if (v.option_values.length === 0) return "Default";
  return v.option_values.map((o) => o.value).join(" / ");
}

function available(v: VariantResponse): number {
  return v.inventory.quantity_available;
}

export default function CreateOrderModal({ open, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const searchRef = useRef<HTMLDivElement>(null);

  // Load the catalog each time the modal opens (stock may have changed).
  useEffect(() => {
    if (!open) return;
    setProductsLoading(true);
    getProducts({ limit: 100 })
      .then((res) => setProducts(res.products.filter((p) => p.status === "active")))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [open]);

  // Reset when closed.
  useEffect(() => {
    if (!open) {
      setCart([]);
      setForm(EMPTY_FORM);
      setQuery("");
      setError("");
      setFieldErrors({});
    }
  }, [open]);

  // Close the search dropdown on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isSubmitting, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      : products;
    return list.slice(0, 8);
  }, [products, query]);

  const update = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((fe) => {
      const next = { ...fe };
      delete next[key];
      return next;
    });
  };

  const addProduct = async (product: ProductResponse) => {
    setShowResults(false);
    setQuery("");
    const key = `${product.id}-${Date.now()}`;
    setCart((c) => [...c, { key, product, variants: null, variantId: "", quantity: 1 }]);
    try {
      const variants = await listVariants(product.id);
      const firstInStock = variants.find((v) => available(v) > 0) ?? variants[0];
      setCart((c) =>
        c.map((l) => (l.key === key ? { ...l, variants, variantId: firstInStock?.id ?? "" } : l)),
      );
    } catch {
      setCart((c) => c.filter((l) => l.key !== key));
      setError(`Couldn't load variants for ${product.name}.`);
    }
  };

  const setLine = (key: string, patch: Partial<CartLine>) =>
    setCart((c) => c.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const removeLine = (key: string) => setCart((c) => c.filter((l) => l.key !== key));

  const inStore = form.channel === "pos";

  const pricingLines = cart
    .map((l) => {
      const v = l.variants?.find((x) => x.id === l.variantId);
      return v ? { unitPrice: Number(v.price), quantity: l.quantity } : null;
    })
    .filter((x): x is { unitPrice: number; quantity: number } => x !== null);

  const pricing = priceOrder(pricingLines, { discountCode: form.discountCode, inStore });

  const stockProblem = cart.find((l) => {
    const v = l.variants?.find((x) => x.id === l.variantId);
    return v ? l.quantity > available(v) : false;
  });

  const canSubmit =
    cart.length > 0 &&
    cart.every((l) => l.variants && l.variantId) &&
    !stockProblem &&
    !pricing.discountError &&
    form.name.trim() &&
    form.phone.trim() &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setFieldErrors({});
    try {
      setIsSubmitting(true);
      const order = await createOrder({
        customer: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() },
        shipping_address: {
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          state: form.state,
          pincode: form.pincode.trim(),
        },
        channel: form.channel,
        payment_method: form.paymentMethod,
        mark_as_paid: form.markAsPaid,
        discount_code: form.discountCode.trim() || undefined,
        note: form.note.trim() || undefined,
        items: cart.map((l) => ({ product_id: l.product.id, variant_id: l.variantId, quantity: l.quantity })),
      });
      onCreated(order);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        // Map API field names onto form keys.
        const map: Record<string, string> = {
          customer_name: "name",
          customer_phone: "phone",
          customer_email: "email",
          address_line1: "line1",
          address_city: "city",
          address_state: "state",
          address_pincode: "pincode",
          discount_code: "discountCode",
        };
        const fe: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.fields ?? {})) fe[map[k] ?? k] = v;
        setFieldErrors(fe);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:py-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Create order</h2>
              <p className="mt-0.5 text-xs text-muted-text">
                Record a phone, WhatsApp or in-store order. Stock is reserved as soon as it&apos;s created.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-text transition hover:bg-border/30 hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          {/* Left */}
          <div className="space-y-6 p-6">
            {/* Products */}
            <section>
              <h3 className="mb-3 text-sm font-bold text-foreground">Products</h3>
              <div ref={searchRef} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder={productsLoading ? "Loading catalog…" : "Search products by name or SKU"}
                  className={`${inputClass} pl-10`}
                  disabled={isSubmitting}
                />
                {showResults && !productsLoading && (
                  <div className="absolute z-10 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl">
                    {results.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-muted-text">No active products match.</p>
                    ) : (
                      results.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-background"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7]">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="font-mono text-[11px] text-muted-text">{p.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{formatINR(p.price, false)}</p>
                            <p
                              className={`text-[11px] font-medium ${
                                p.inventory.quantity_available === 0
                                  ? "text-rose-500"
                                  : p.inventory.quantity_available <= 5
                                    ? "text-amber-500"
                                    : "text-muted-text"
                              }`}
                            >
                              {p.inventory.quantity_available === 0
                                ? "Out of stock"
                                : `${p.inventory.quantity_available} available`}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
                  <p className="text-sm text-muted-text">Search above to add products to this order.</p>
                  {fieldErrors.items && <p className="mt-1 text-xs text-red-500">{fieldErrors.items}</p>}
                </div>
              ) : (
                <div className="mt-3 divide-y divide-border rounded-xl border border-border">
                  {cart.map((l) => {
                    const v = l.variants?.find((x) => x.id === l.variantId);
                    const avail = v ? available(v) : 0;
                    const over = v ? l.quantity > avail : false;
                    return (
                      <div key={l.key} className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{l.product.name}</p>
                          {l.variants === null ? (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-text">
                              <Loader2 className="h-3 w-3 animate-spin" /> Loading variants…
                            </p>
                          ) : l.variants.length > 1 ? (
                            <select
                              value={l.variantId}
                              onChange={(e) => setLine(l.key, { variantId: e.target.value })}
                              className="mt-1.5 w-full max-w-xs rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                              disabled={isSubmitting}
                            >
                              {l.variants.map((x) => (
                                <option key={x.id} value={x.id} disabled={available(x) === 0}>
                                  {variantLabel(x)} — {available(x) === 0 ? "out of stock" : `${available(x)} available`}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="mt-1 font-mono text-[11px] text-muted-text">
                              {v?.sku} · {avail} available
                            </p>
                          )}
                          {over && (
                            <p className="mt-1 text-[11px] font-medium text-rose-500">
                              Only {avail} unit{avail === 1 ? "" : "s"} available
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-lg border border-border">
                            <button
                              type="button"
                              onClick={() => setLine(l.key, { quantity: Math.max(1, l.quantity - 1) })}
                              className="flex h-8 w-8 items-center justify-center text-muted-text hover:text-foreground"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              value={l.quantity}
                              onChange={(e) => {
                                const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                                setLine(l.key, { quantity: Number.isFinite(n) && n > 0 ? n : 1 });
                              }}
                              className="h-8 w-10 bg-transparent text-center text-sm font-semibold text-foreground outline-none"
                              aria-label="Quantity"
                            />
                            <button
                              type="button"
                              onClick={() => setLine(l.key, { quantity: l.quantity + 1 })}
                              className="flex h-8 w-8 items-center justify-center text-muted-text hover:text-foreground"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="w-24 text-right text-sm font-bold text-foreground">
                            {v ? formatINR(Number(v.price) * l.quantity) : "—"}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeLine(l.key)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-text hover:bg-rose-500/10 hover:text-rose-500"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Customer */}
            <section>
              <h3 className="mb-3 text-sm font-bold text-foreground">Customer</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Full name" error={fieldErrors.name}>
                  <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Priya Nair" disabled={isSubmitting} />
                </Field>
                <Field label="Mobile number" error={fieldErrors.phone}>
                  <input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" inputMode="tel" disabled={isSubmitting} />
                </Field>
                <Field label="Email (optional)" error={fieldErrors.email}>
                  <input className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="priya@example.com" type="email" disabled={isSubmitting} />
                </Field>
              </div>
            </section>

            {/* Address */}
            {!inStore && (
              <section>
                <h3 className="mb-3 text-sm font-bold text-foreground">Shipping address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="House / flat, building" error={fieldErrors.line1}>
                    <input className={inputClass} value={form.line1} onChange={(e) => update("line1", e.target.value)} placeholder="42, Lakeview Residency" disabled={isSubmitting} />
                  </Field>
                  <Field label="Area / locality (optional)">
                    <input className={inputClass} value={form.line2} onChange={(e) => update("line2", e.target.value)} placeholder="Indiranagar" disabled={isSubmitting} />
                  </Field>
                  <Field label="City" error={fieldErrors.city}>
                    <input className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Bengaluru" disabled={isSubmitting} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="State" error={fieldErrors.state}>
                      <select className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)} disabled={isSubmitting}>
                        <option value="">Select</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="PIN code" error={fieldErrors.pincode}>
                      <input className={inputClass} value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="560038" inputMode="numeric" disabled={isSubmitting} />
                    </Field>
                  </div>
                </div>
              </section>
            )}

            <section>
              <Field label="Order note (optional)">
                <textarea className={`${inputClass} min-h-[72px] resize-y`} value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="e.g. Gift wrap, deliver after 6 PM" disabled={isSubmitting} />
              </Field>
            </section>
          </div>

          {/* Right: details & summary */}
          <div className="space-y-5 border-t border-border bg-background/40 p-6 lg:border-l lg:border-t-0">
            <Field label="Sales channel">
              <select
                className={inputClass}
                value={form.channel}
                onChange={(e) => {
                  const ch = e.target.value as SalesChannel;
                  update("channel", ch);
                  if (ch === "pos" && form.paymentMethod === "cod") update("paymentMethod", "upi");
                }}
                disabled={isSubmitting}
              >
                {(Object.keys(CHANNEL_LABEL) as SalesChannel[]).map((c) => (
                  <option key={c} value={c}>
                    {CHANNEL_LABEL[c]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Payment method">
              <select
                className={inputClass}
                value={form.paymentMethod}
                onChange={(e) => {
                  const m = e.target.value as PaymentMethod;
                  update("paymentMethod", m);
                  update("markAsPaid", m !== "cod");
                }}
                disabled={isSubmitting}
              >
                {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[])
                  .filter((m) => !(inStore && m === "cod"))
                  .map((m) => (
                    <option key={m} value={m}>
                      {PAYMENT_METHOD_LABEL[m]}
                    </option>
                  ))}
              </select>
            </Field>

            {!inStore && (
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={form.markAsPaid}
                  onChange={(e) => update("markAsPaid", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#0284c7]"
                  disabled={isSubmitting}
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Payment received</span>
                  <span className="block text-xs text-muted-text">
                    {form.paymentMethod === "cod" ? "Leave unticked — cash is collected on delivery." : "Untick if the customer hasn't paid yet."}
                  </span>
                </span>
              </label>
            )}

            <Field label="Discount code" error={fieldErrors.discountCode || (form.discountCode.trim() ? pricing.discountError : undefined)}>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
                <input
                  className={`${inputClass} pl-9 uppercase`}
                  value={form.discountCode}
                  onChange={(e) => update("discountCode", e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  list="discount-codes"
                  disabled={isSubmitting}
                />
                <datalist id="discount-codes">
                  {DISCOUNT_CODES.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.label}
                    </option>
                  ))}
                </datalist>
              </div>
            </Field>

            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="mb-3 text-sm font-bold text-foreground">Summary</h4>
              <dl className="space-y-2 text-sm">
                <Row label={`Subtotal (${pricingLines.reduce((s, l) => s + l.quantity, 0)} items)`} value={formatINR(pricing.subtotal)} />
                {pricing.discount > 0 && (
                  <Row label={`Discount (${form.discountCode.trim().toUpperCase()})`} value={`− ${formatINR(pricing.discount)}`} accent />
                )}
                <Row label="Shipping" value={pricing.shipping === 0 ? (pricingLines.length ? "Free" : "—") : formatINR(pricing.shipping)} />
                <div className="border-t border-border pt-2">
                  <Row label="Total" value={formatINR(pricing.total)} bold />
                </div>
                <p className="text-[11px] text-muted-text">Includes GST of {formatINR(pricing.taxIncluded)}</p>
                {!inStore && pricing.subtotal > 0 && pricing.shipping > 0 && (
                  <p className="text-[11px] text-muted-text">
                    Add {formatINR(FREE_SHIPPING_MIN - (pricing.subtotal - pricing.discount), false)} more for free shipping.
                  </p>
                )}
              </dl>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating…" : `Create order${pricing.total ? ` · ${formatINR(pricing.total, false)}` : ""}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={bold ? "font-bold text-foreground" : "text-muted-text"}>{label}</dt>
      <dd className={`${bold ? "text-base font-bold text-foreground" : "font-semibold text-foreground"} ${accent ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
