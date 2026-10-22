"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  IndianRupee,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";

import { getOrders, updateFulfillment } from "@/lib/api/order.api";
import { ApiError } from "@/lib/api/api-error";
import {
  CHANNEL_LABEL,
  FULFILLMENT_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  formatINR,
  formatShortDate,
  formatTime,
  initials,
  timeAgo,
} from "@/lib/orders/format";
import type {
  FulfillmentStatus,
  OrderResponse,
  PaymentStatus,
  SalesChannel,
} from "@/types/order";
import { FulfillmentBadge, PaymentBadge } from "./OrderBadges";
import CreateOrderModal from "./CreateOrderModal";

const PAGE_SIZE = 15;

type RangeKey = "today" | "7d" | "30d" | "90d" | "all";
const RANGES: Array<{ key: RangeKey; label: string; days?: number }> = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time" },
];

type Tab = "all" | FulfillmentStatus;
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Unfulfilled" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

type SortKey = "newest" | "oldest" | "total_desc" | "total_asc";

const selectClass =
  "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20";

// Orders that count as revenue (not cancelled, not returned).
const isRevenue = (o: OrderResponse) =>
  o.fulfillment_status !== "cancelled" && o.fulfillment_status !== "returned";

function rangeStart(key: RangeKey): number {
  const r = RANGES.find((x) => x.key === key);
  if (!r?.days) return 0;
  if (key === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  return Date.now() - r.days * 24 * 3600 * 1000;
}

export default function OrdersView() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [range, setRange] = useState<RangeKey>("30d");
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<"all" | PaymentStatus>("all");
  const [channel, setChannel] = useState<"all" | SalesChannel>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await getOrders();
      setOrders(res.orders);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 and clear selection whenever the filters change.
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [range, tab, search, payment, channel, sort]);

  /* ---------------- derived data ---------------- */

  const inRange = useMemo(() => {
    const start = rangeStart(range);
    return orders.filter((o) => new Date(o.created_at).getTime() >= start);
  }, [orders, range]);

  const stats = useMemo(() => {
    const r = RANGES.find((x) => x.key === range);
    const revenueOrders = inRange.filter(isRevenue);
    const revenue = revenueOrders.reduce((s, o) => s + Number(o.total), 0);

    // Previous period of the same length, for the trend arrows.
    let prevCount: number | null = null;
    let prevRevenue: number | null = null;
    if (r?.days && range !== "today") {
      const end = rangeStart(range);
      const start = end - r.days * 24 * 3600 * 1000;
      const prev = orders.filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= start && t < end;
      });
      prevCount = prev.length;
      prevRevenue = prev.filter(isRevenue).reduce((s, o) => s + Number(o.total), 0);
    }

    const open = orders.filter(
      (o) => o.fulfillment_status === "pending" || o.fulfillment_status === "processing",
    );
    const awaitingPayment = open.filter(
      (o) => o.payment_status === "pending" || o.payment_status === "failed",
    ).length;

    return {
      count: inRange.length,
      revenue,
      aov: revenueOrders.length ? revenue / revenueOrders.length : 0,
      prevCount,
      prevRevenue,
      open: open.length,
      awaitingPayment,
      inTransit: orders.filter((o) => o.fulfillment_status === "shipped").length,
    };
  }, [orders, inRange, range]);

  const tabCounts = useMemo(() => {
    const c: Record<string, number> = { all: inRange.length };
    for (const o of inRange) c[o.fulfillment_status] = (c[o.fulfillment_status] ?? 0) + 1;
    return c;
  }, [inRange]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = inRange.filter((o) => {
      if (tab !== "all" && o.fulfillment_status !== tab) return false;
      if (payment !== "all" && o.payment_status !== payment) return false;
      if (channel !== "all" && o.channel !== channel) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        o.shipping_address.city.toLowerCase().includes(q) ||
        o.items.some((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
      );
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.created_at.localeCompare(b.created_at);
        case "total_desc":
          return Number(b.total) - Number(a.total);
        case "total_asc":
          return Number(a.total) - Number(b.total);
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
    return sorted;
  }, [inRange, tab, payment, channel, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasFilters = search || payment !== "all" || channel !== "all" || tab !== "all";

  /* ---------------- selection & bulk actions ---------------- */

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((o) => selected.has(o.id));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((o) => next.delete(o.id));
      else pageRows.forEach((o) => next.add(o.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedOrders = orders.filter((o) => selected.has(o.id));

  const runBulk = async (status: "processing" | "shipped") => {
    const eligible = selectedOrders.filter((o) =>
      status === "processing"
        ? o.fulfillment_status === "pending"
        : o.fulfillment_status === "pending" || o.fulfillment_status === "processing",
    );
    const skipped = selectedOrders.length - eligible.length;

    if (eligible.length === 0) {
      setNotice({
        tone: "error",
        text:
          status === "processing"
            ? "None of the selected orders are unfulfilled."
            : "None of the selected orders can be shipped (already shipped, delivered or cancelled).",
      });
      return;
    }

    setBulkBusy(true);
    setNotice(null);
    let done = 0;
    const failures: string[] = [];
    for (const o of eligible) {
      try {
        await updateFulfillment(o.id, { status });
        done++;
      } catch (err) {
        failures.push(`${o.order_number}: ${err instanceof ApiError ? err.message : "failed"}`);
      }
    }
    setBulkBusy(false);
    setSelected(new Set());
    await load();

    const verb = status === "processing" ? "marked as processing" : "marked as shipped";
    const parts = [`${done} order${done === 1 ? "" : "s"} ${verb}.`];
    if (skipped) parts.push(`${skipped} skipped (not eligible).`);
    if (failures.length) parts.push(failures.join(" · "));
    setNotice({ tone: failures.length ? "error" : "ok", text: parts.join(" ") });
  };

  const exportCsv = (rows: OrderResponse[]) => {
    const header = [
      "Order",
      "Date",
      "Customer",
      "Email",
      "Phone",
      "City",
      "State",
      "Channel",
      "Items",
      "Units",
      "Subtotal",
      "Discount",
      "Shipping",
      "Total",
      "Payment method",
      "Payment status",
      "Fulfillment",
      "Courier",
      "AWB",
    ];
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = rows.map((o) =>
      [
        o.order_number,
        new Date(o.created_at).toLocaleString("en-IN"),
        o.customer.name,
        o.customer.email,
        o.customer.phone,
        o.shipping_address.city,
        o.shipping_address.state,
        CHANNEL_LABEL[o.channel],
        o.items.map((i) => `${i.name}${i.variant_title ? ` (${i.variant_title})` : ""} x${i.quantity}`).join("; "),
        o.items.reduce((s, i) => s + i.quantity, 0),
        o.subtotal,
        o.discount,
        o.shipping_fee,
        o.total,
        PAYMENT_METHOD_LABEL[o.payment_method],
        PAYMENT_STATUS_LABEL[o.payment_status],
        FULFILLMENT_LABEL[o.fulfillment_status],
        o.shipment?.courier ?? "",
        o.shipment?.tracking_number ?? "",
      ]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setPayment("all");
    setChannel("all");
    setTab("all");
  };

  /* ---------------- render ---------------- */

  return (
    <div className="mx-auto w-full max-w-[1400px] px-2 py-4 lg:px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0284c7]/10 text-[#0284c7]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Orders</h1>
            <p className="mt-1 text-sm text-muted-text">
              Track, fulfil and manage orders from every sales channel.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            Create order
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === r.key
                  ? "bg-[#0284c7] text-white shadow-sm"
                  : "text-muted-text hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isLoading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-text transition-colors hover:text-foreground disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Orders"
          value={isLoading ? "—" : stats.count.toLocaleString("en-IN")}
          current={stats.count}
          previous={stats.prevCount}
        />
        <StatCard
          icon={<IndianRupee className="h-4 w-4" />}
          label="Net sales"
          value={isLoading ? "—" : formatINR(stats.revenue, false)}
          current={stats.revenue}
          previous={stats.prevRevenue}
          hint="Excludes cancelled & returned"
        />
        <StatCard
          icon={<PackageCheck className="h-4 w-4" />}
          label="Average order value"
          value={isLoading ? "—" : formatINR(stats.aov, false)}
          hint={range === "all" ? "All time" : `Last ${RANGES.find((r) => r.key === range)?.label.toLowerCase()}`}
        />
        <StatCard
          icon={<Clock3 className="h-4 w-4" />}
          label="To fulfil"
          value={isLoading ? "—" : String(stats.open)}
          tone={stats.open > 0 ? "amber" : undefined}
          hint={
            isLoading
              ? ""
              : `${stats.inTransit} in transit${stats.awaitingPayment ? ` · ${stats.awaitingPayment} awaiting payment` : ""}`
          }
          onClick={() => setTab("pending")}
        />
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count = tabCounts[t.key] ?? 0;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-2 text-sm font-semibold transition-colors ${
                  active ? "text-[#0284c7]" : "text-muted-text hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? "bg-[#0284c7]/15 text-[#0284c7]" : "bg-background text-muted-text"
                  }`}
                >
                  {count}
                </span>
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#0284c7]" />}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, phone, city or SKU…"
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-text hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select value={payment} onChange={(e) => setPayment(e.target.value as typeof payment)} className={selectClass}>
              <option value="all">All payments</option>
              {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((p) => (
                <option key={p} value={p}>
                  {PAYMENT_STATUS_LABEL[p]}
                </option>
              ))}
            </select>
            <select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} className={selectClass}>
              <option value="all">All channels</option>
              {(Object.keys(CHANNEL_LABEL) as SalesChannel[]).map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c]}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="total_desc">Highest total</option>
              <option value="total_asc">Lowest total</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 rounded-xl px-3 text-sm font-semibold text-muted-text hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-[#0284c7]/5 px-4 py-2.5">
            <span className="mr-2 text-sm font-semibold text-foreground">{selected.size} selected</span>
            <BulkButton disabled={bulkBusy} onClick={() => runBulk("processing")}>
              <PackageCheck className="h-3.5 w-3.5" /> Mark as processing
            </BulkButton>
            <BulkButton disabled={bulkBusy} onClick={() => runBulk("shipped")}>
              <Truck className="h-3.5 w-3.5" /> Mark as shipped
            </BulkButton>
            <BulkButton disabled={bulkBusy} onClick={() => exportCsv(selectedOrders)}>
              <Download className="h-3.5 w-3.5" /> Export selected
            </BulkButton>
            {bulkBusy && <Loader2 className="h-4 w-4 animate-spin text-[#0284c7]" />}
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-auto text-xs font-semibold text-muted-text hover:text-foreground"
            >
              Clear selection
            </button>
          </div>
        )}

        {notice && (
          <div
            className={`flex items-start gap-2 border-b border-border px-4 py-2.5 text-sm ${
              notice.tone === "ok" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            <span className="flex-1">{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="h-4 w-4 rounded bg-border/60" />
                <div className="h-4 w-24 animate-pulse rounded bg-border/60" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-border/60" />
                <div className="h-4 flex-1 animate-pulse rounded bg-border/60" />
                <div className="h-4 w-20 animate-pulse rounded bg-border/60" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t load orders</p>
            <p className="mt-1 text-xs text-muted-text">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-card"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {orders.length === 0 ? "No orders yet" : "No orders match these filters"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-text">
              {orders.length === 0
                ? "Orders from your store and channels will appear here. You can also create one manually."
                : "Try a different date range, status or search term."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-card"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-left text-sm">
                <thead className="border-b border-border bg-background/40 text-[11px] uppercase tracking-wide text-muted-text">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleAllOnPage}
                        className="h-4 w-4 cursor-pointer accent-[#0284c7]"
                        aria-label="Select all orders on this page"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold">Order</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Customer</th>
                    <th className="px-3 py-3 font-semibold">Channel</th>
                    <th className="px-3 py-3 font-semibold">Items</th>
                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                    <th className="px-3 py-3 font-semibold">Payment</th>
                    <th className="px-3 py-3 font-semibold">Fulfillment</th>
                    <th className="w-8 px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((o) => {
                    const units = o.items.reduce((s, i) => s + i.quantity, 0);
                    const isSelected = selected.has(o.id);
                    return (
                      <tr
                        key={o.id}
                        onClick={() => router.push(`/dashboard/orders/${o.id}`)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected ? "bg-[#0284c7]/5" : "hover:bg-background/60"
                        }`}
                      >
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(o.id)}
                            className="h-4 w-4 cursor-pointer accent-[#0284c7]"
                            aria-label={`Select ${o.order_number}`}
                          />
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="whitespace-nowrap font-bold text-[#0284c7] group-hover:underline">{o.order_number}</p>
                          <p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-text">{timeAgo(o.created_at)}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <p className="font-medium text-foreground">{formatShortDate(o.created_at)}</p>
                          <p className="mt-0.5 text-[11px] text-muted-text">{formatTime(o.created_at)}</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0284c7]/10 text-[11px] font-bold text-[#0284c7]">
                              {initials(o.customer.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{o.customer.name}</p>
                              <p className="truncate text-[11px] text-muted-text">
                                {o.channel === "pos" ? "Walk-in" : `${o.shipping_address.city}, ${o.shipping_address.state}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-muted-text">{CHANNEL_LABEL[o.channel]}</td>
                        <td className="max-w-[220px] px-3 py-3.5">
                          <p className="truncate text-foreground">{o.items[0]?.name}</p>
                          <p className="mt-0.5 text-[11px] text-muted-text">
                            {units} unit{units === 1 ? "" : "s"}
                            {o.items.length > 1 ? ` · +${o.items.length - 1} more` : o.items[0]?.variant_title ? ` · ${o.items[0].variant_title}` : ""}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right font-bold text-foreground">
                          {formatINR(o.total)}
                        </td>
                        <td className="px-3 py-3.5">
                          <PaymentBadge status={o.payment_status} />
                          <p className="mt-1 text-[11px] text-muted-text">{PAYMENT_METHOD_LABEL[o.payment_method]}</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <FulfillmentBadge status={o.fulfillment_status} />
                        </td>
                        <td className="px-3 py-3.5 text-muted-text">
                          <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
              <p className="text-xs text-muted-text">
                Showing <span className="font-semibold text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}</span>–
                <span className="font-semibold text-foreground">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of{" "}
                <span className="font-semibold text-foreground">{filtered.length}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <PageButton disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </PageButton>
                {pageNumbers(currentPage, pageCount).map((n, i) =>
                  n === "…" ? (
                    <span key={`gap-${i}`} className="px-1.5 text-xs text-muted-text">
                      …
                    </span>
                  ) : (
                    <PageButton key={n} active={n === currentPage} onClick={() => setPage(n)}>
                      {n}
                    </PageButton>
                  ),
                )}
                <PageButton disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </PageButton>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateOrderModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(order) => {
          setShowCreate(false);
          router.push(`/dashboard/orders/${order.id}`);
        }}
      />
    </div>
  );
}

/* ============================================================
   SMALL PIECES
============================================================ */

function StatCard({
  icon,
  label,
  value,
  hint,
  current,
  previous,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  current?: number;
  previous?: number | null;
  tone?: "amber";
  onClick?: () => void;
}) {
  let trend: React.ReactNode = null;
  if (previous !== undefined && previous !== null && current !== undefined && previous > 0) {
    const pct = ((current - previous) / previous) * 100;
    const up = pct >= 0;
    trend = (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
          up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        }`}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(pct).toFixed(1)}%<span className="font-medium text-muted-text">vs previous period</span>
      </span>
    );
  }

  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card p-5 text-left shadow-sm ${
        onClick ? "transition-colors hover:border-[#0284c7]/40" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-text">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            tone === "amber" ? "bg-amber-500/10 text-amber-500" : "bg-[#0284c7]/10 text-[#0284c7]"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <div className="mt-1.5 min-h-[16px]">{trend ?? <span className="text-[11px] text-muted-text">{hint}</span>}</div>
    </Comp>
  );
}

function BulkButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[#0284c7]/40 hover:text-[#0284c7] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-[#0284c7] text-white" : "text-muted-text hover:bg-background hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function pageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
