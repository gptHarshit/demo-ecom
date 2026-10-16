"use client";

import React, { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Package,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

import type { ProductResponse } from "@/types/product";

interface AnalyticsModalProps {
  open: boolean;
  products: ProductResponse[];
  onClose: () => void;
}

const getStockStatus = (quantity: number) => {
  if (quantity === 0) {
    return {
      label: "Out of Stock",
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      bar: "bg-rose-500",
    };
  }

  if (quantity <= 10) {
    return {
      label: "Low Stock",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      bar: "bg-amber-500",
    };
  }

  return {
    label: "In Stock",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    bar: "bg-emerald-500",
  };
};

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  open,
  products,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const totalProducts = products.length;

  const totalOnHand = products.reduce(
    (sum, product) => sum + product.inventory.quantity_on_hand,
    0,
  );

  const totalAvailable = products.reduce(
    (sum, product) => sum + product.inventory.quantity_available,
    0,
  );

  const totalReserved = products.reduce(
    (sum, product) =>
      sum + (product.inventory.quantity_reserved ?? 0),
    0,
  );

  const inStockProducts = products.filter(
    (product) =>
      product.inventory.quantity_available > 10,
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      product.inventory.quantity_available > 0 &&
      product.inventory.quantity_available <= 10,
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      product.inventory.quantity_available === 0,
  ).length;

  const stockHealth =
    totalProducts === 0
      ? 0
      : Math.round(
          (inStockProducts / totalProducts) * 100,
        );

  const maxQuantity = Math.max(
    ...products.map(
      (product) =>
        product.inventory.quantity_on_hand,
    ),
    1,
  );

  const attentionProducts = [...products]
    .filter(
      (product) =>
        product.inventory.quantity_available <= 10,
    )
    .sort(
      (a, b) =>
        a.inventory.quantity_available -
        b.inventory.quantity_available,
    )
    .slice(0, 5);

  const topProducts = [...products]
    .sort(
      (a, b) =>
        b.inventory.quantity_on_hand -
        a.inventory.quantity_on_hand,
    )
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0284c7]/10 text-[#0284c7]">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Inventory Analytics
              </h2>

              <p className="mt-0.5 text-sm text-muted-text">
                A quick overview of your current inventory health.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2.5 text-muted-text transition hover:bg-muted hover:text-foreground"
            aria-label="Close analytics"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              icon={<Package className="h-5 w-5" />}
              label="Total Products"
              value={totalProducts}
              description="Products in inventory"
              iconClass="bg-sky-500/10 text-sky-600"
            />

            <AnalyticsCard
              icon={<Boxes className="h-5 w-5" />}
              label="On Hand"
              value={totalOnHand}
              description="Physical stock available"
              iconClass="bg-indigo-500/10 text-indigo-600"
            />

            <AnalyticsCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Available"
              value={totalAvailable}
              description="Ready to sell"
              iconClass="bg-emerald-500/10 text-emerald-600"
            />

            <AnalyticsCard
              icon={<Activity className="h-5 w-5" />}
              label="Reserved"
              value={totalReserved}
              description="Currently reserved"
              iconClass="bg-violet-500/10 text-violet-600"
            />
          </div>

          {/* Main Analytics Grid */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Stock Health */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Stock Health
                  </h3>

                  <p className="mt-1 text-xs text-muted-text">
                    Overall inventory condition
                  </p>
                </div>

                <TrendingUp className="h-5 w-5 text-[#0284c7]" />
              </div>

              <div className="mt-7 flex items-center justify-center">
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#10b981 ${stockHealth}%, hsl(var(--muted)) ${stockHealth}% 100%)`,
                  }}
                >
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-card">
                    <span className="text-3xl font-bold text-foreground">
                      {stockHealth}%
                    </span>

                    <span className="mt-1 text-xs text-muted-text">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <StockLegend
                  color="bg-emerald-500"
                  label="In Stock"
                  value={inStockProducts}
                />

                <StockLegend
                  color="bg-amber-500"
                  label="Low Stock"
                  value={lowStockProducts}
                />

                <StockLegend
                  color="bg-rose-500"
                  label="Out of Stock"
                  value={outOfStockProducts}
                />
              </div>
            </div>

            {/* Inventory Breakdown */}
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Inventory Breakdown
                  </h3>

                  <p className="mt-1 text-xs text-muted-text">
                    How your stock is distributed
                  </p>
                </div>

                <Boxes className="h-5 w-5 text-muted-text" />
              </div>

              <div className="mt-8 space-y-7">
                <InventoryMetric
                  label="On Hand"
                  value={totalOnHand}
                  percentage={100}
                  color="bg-indigo-500"
                />

                <InventoryMetric
                  label="Available"
                  value={totalAvailable}
                  percentage={
                    totalOnHand
                      ? (totalAvailable / totalOnHand) * 100
                      : 0
                  }
                  color="bg-emerald-500"
                />

                <InventoryMetric
                  label="Reserved"
                  value={totalReserved}
                  percentage={
                    totalOnHand
                      ? (totalReserved / totalOnHand) * 100
                      : 0
                  }
                  color="bg-violet-500"
                />
              </div>

              <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0284c7]" />

                  <span className="text-sm font-medium text-foreground">
                    Inventory utilization
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-text">
                  {totalOnHand > 0
                    ? Math.round(
                        (totalAvailable / totalOnHand) * 100,
                      )
                    : 0}
                  % of your physical stock is currently available.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Attention Required */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Attention Required
                  </h3>

                  <p className="mt-1 text-xs text-muted-text">
                    Products that may need restocking
                  </p>
                </div>

                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>

              {attentionProducts.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />

                  <p className="mt-3 text-sm font-medium text-foreground">
                    Everything looks good
                  </p>

                  <p className="mt-1 text-xs text-muted-text">
                    No products require immediate attention.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {attentionProducts.map((product) => {
                    const quantity =
                      product.inventory.quantity_available;

                    const stockStatus =
                      getStockStatus(quantity);

                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl border border-border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {product.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-text">
                            {product.sku}
                          </p>
                        </div>

                        <div className="ml-4 flex items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>

                          <span className="min-w-8 text-right text-sm font-bold text-foreground">
                            {quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Inventory */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Inventory Distribution
                  </h3>

                  <p className="mt-1 text-xs text-muted-text">
                    Products with the highest stock levels
                  </p>
                </div>

                <BarChart3 className="h-5 w-5 text-[#0284c7]" />
              </div>

              {topProducts.length === 0 ? (
                <div className="mt-8 flex items-center justify-center py-8 text-sm text-muted-text">
                  No inventory data available.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {topProducts.map((product) => {
                    const quantity =
                      product.inventory.quantity_on_hand;

                    const percentage =
                      (quantity / maxQuantity) * 100;

                    return (
                      <div key={product.id}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {product.name}
                            </p>

                            <p className="text-[11px] text-muted-text">
                              {product.sku}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-semibold text-foreground">
                            {quantity}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[#0284c7] transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Insight */}
          <div className="mt-5 rounded-2xl border border-[#0284c7]/20 bg-[#0284c7]/5 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
                <CircleAlert className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Inventory snapshot
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-text">
                  You currently have{" "}
                  <span className="font-semibold text-foreground">
                    {totalAvailable}
                  </span>{" "}
                  units available across{" "}
                  <span className="font-semibold text-foreground">
                    {totalProducts}
                  </span>{" "}
                  products.{" "}
                  {outOfStockProducts > 0
                    ? `${outOfStockProducts} product${
                        outOfStockProducts > 1 ? "s are" : " is"
                      } completely out of stock.`
                    : lowStockProducts > 0
                      ? `${lowStockProducts} product${
                          lowStockProducts > 1 ? "s are" : " is"
                        } running low.`
                      : "There are currently no critical stock issues."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AnalyticsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  iconClass: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  icon,
  label,
  value,
  description,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-muted-text">
          Live
        </span>
      </div>

      <p className="mt-5 text-sm text-muted-text">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-muted-text">
        {description}
      </p>
    </div>
  );
};

interface StockLegendProps {
  color: string;
  label: string;
  value: number;
}

const StockLegend: React.FC<StockLegendProps> = ({
  color,
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${color}`}
        />

        <span className="text-sm text-muted-text">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
};

interface InventoryMetricProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const InventoryMetric: React.FC<InventoryMetricProps> = ({
  label,
  value,
  percentage,
  color,
}) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {label}
        </span>

        <span className="text-sm font-semibold text-foreground">
          {value.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      <p className="mt-1.5 text-right text-[11px] text-muted-text">
        {Math.round(percentage)}%
      </p>
    </div>
  );
};