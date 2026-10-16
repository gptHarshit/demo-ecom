"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Package,
  Warehouse,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
} from "lucide-react";

import type { ProductResponse } from "@/types/product";

interface InventoryTableProps {
  products: ProductResponse[];

  onAdjust?: (
    product: ProductResponse,
    quantityDelta: number,
  ) => void | Promise<void>;
}

const getStockStatus = (available: number) => {
  if (available <= 0) {
    return {
      label: "Out of stock",
      dot: "bg-rose-500",
      className:
        "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    };
  }

  if (available <= 10) {
    return {
      label: "Low stock",
      dot: "bg-amber-500",
      className:
        "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }

  return {
    label: "In stock",
    dot: "bg-emerald-500",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
};

const formatPrice = (price: string) => {
  const value = Number(price);

  if (Number.isNaN(value)) {
    return `₹${price}`;
  }

  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onAdjust,
}) => {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);

  const [adjustmentType, setAdjustmentType] = useState<
    "increase" | "decrease"
  >("increase");

  const [quantity, setQuantity] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAdjustment = (product: ProductResponse) => {
    setSelectedProduct(product);
    setAdjustmentType("increase");
    setQuantity(1);
  };

  const closeAdjustment = () => {
    if (isSubmitting) return;

    setSelectedProduct(null);
    setQuantity(1);
    setAdjustmentType("increase");
  };

  const handleAdjustment = async () => {
    if (!selectedProduct || quantity <= 0) {
      return;
    }

    const quantityDelta =
      adjustmentType === "increase"
        ? quantity
        : -quantity;

    try {
      setIsSubmitting(true);

      await onAdjust?.(
        selectedProduct,
        quantityDelta,
      );

      closeAdjustment();
    } catch (error) {
      console.error(
        "Inventory adjustment failed:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Inventory Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 shrink-0 text-[#0284c7]" />

            <div>
              <p className="text-sm font-semibold text-foreground">
                Inventory
              </p>

              <p className="text-xs text-muted-text">
                Stock levels across your product catalog
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-border bg-background/60">
                <th className="w-[24%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-text sm:px-4">
                  Product
                </th>

                <th className="w-[12%] px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  SKU
                </th>

                <th className="w-[12%] px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  Price
                </th>

                <th className="w-[9%] px-2 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  On hand
                </th>

                <th className="w-[11%] px-2 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  Available
                </th>

                <th className="w-[13%] px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  Stock
                </th>

                <th className="w-[10%] px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  Status
                </th>

                <th className="w-[9%] px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-text">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
                        <Package className="h-5 w-5" />
                      </div>

                      <p className="text-sm font-semibold text-foreground">
                        No inventory found
                      </p>

                      <p className="mt-1 text-xs text-muted-text">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const inventory = product.inventory;

                  const onHand =
                    inventory?.quantity_on_hand ?? 0;

                  const reserved =
                    inventory?.quantity_reserved ?? 0;

                  const available =
                    inventory?.quantity_available ??
                    Math.max(
                      0,
                      onHand - reserved,
                    );

                  const stockStatus =
                    getStockStatus(available);

                  return (
                    <tr
                      key={product.id}
                      className="
                        border-b
                        border-border
                        last:border-b-0
                        transition-colors
                        hover:bg-background/60
                      "
                    >
                      {/* Product */}
                      <td className="px-3 py-3 sm:px-4 sm:py-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7]">
                            <Package className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {product.name}
                            </p>

                            {product.description ? (
                              <p className="mt-0.5 truncate text-[11px] text-muted-text">
                                {product.description}
                              </p>
                            ) : (
                              <p className="mt-0.5 text-[11px] text-muted-text">
                                No description
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-2 py-3">
                        <span className="block truncate rounded-md bg-background px-2 py-1 font-mono text-[11px] text-muted-text">
                          {product.sku}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-2 py-3">
                        <span className="text-xs font-semibold text-foreground sm:text-sm">
                          {formatPrice(product.price)}
                        </span>
                      </td>

                      {/* On Hand */}
                      <td className="px-2 py-3 text-right">
                        <span className="text-sm font-semibold text-foreground">
                          {onHand}
                        </span>
                      </td>

                      {/* Available */}
                      <td className="px-2 py-3 text-right">
                        <span
                          className={`text-sm font-bold ${
                            available <= 0
                              ? "text-rose-500"
                              : available <= 10
                                ? "text-amber-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {available}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-2 py-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1
                            rounded-full
                            border
                            px-2
                            py-1
                            text-[10px]
                            font-semibold
                            whitespace-nowrap
                            ${stockStatus.className}
                          `}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${stockStatus.dot}`}
                          />

                          {stockStatus.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-2 py-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            rounded-full
                            border
                            px-2
                            py-1
                            text-[10px]
                            font-semibold
                            capitalize
                            whitespace-nowrap
                            ${
                              product.status === "active"
                                ? "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                : product.status ===
                                    "archived"
                                  ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "border-border bg-background text-muted-text"
                            }
                          `}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Adjust */}
                      <td className="px-2 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            openAdjustment(product)
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-lg
                            border
                            border-[#0284c7]/20
                            bg-[#0284c7]/10
                            px-2.5
                            py-1.5
                            text-[11px]
                            font-semibold
                            text-[#0284c7]
                            transition-colors
                            hover:bg-[#0284c7]/20
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#0284c7]/30
                          "
                        >
                          <SlidersHorizontal className="h-3 w-3" />

                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-muted-text" />

            <p className="text-xs text-muted-text">
              Available stock is calculated after reserved inventory.
            </p>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdjustment();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Adjust Inventory
                </h2>

                <p className="mt-1 text-xs text-muted-text">
                  Update stock quantity for{" "}
                  <span className="font-medium text-foreground">
                    {selectedProduct.name}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeAdjustment}
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-muted-text transition-colors hover:bg-background hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Stock */}
            <div className="mt-5 rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-text">
                  Current stock
                </span>

                <span className="text-lg font-bold text-foreground">
                  {selectedProduct.inventory
                    ?.quantity_on_hand ?? 0}
                </span>
              </div>
            </div>

            {/* Increase / Decrease */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-foreground">
                Adjustment type
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAdjustmentType("increase")
                  }
                  disabled={isSubmitting}
                  className={`
                    flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors
                    ${
                      adjustmentType === "increase"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-background text-muted-text hover:text-foreground"
                    }
                  `}
                >
                  <Plus className="h-4 w-4" />

                  Increase
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAdjustmentType("decrease")
                  }
                  disabled={isSubmitting}
                  className={`
                    flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors
                    ${
                      adjustmentType === "decrease"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "border-border bg-background text-muted-text hover:text-foreground"
                    }
                  `}
                >
                  <Minus className="h-4 w-4" />

                  Decrease
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <label
                htmlFor="adjustment-quantity"
                className="mb-2 block text-xs font-medium text-foreground"
              >
                Quantity
              </label>

              <input
                id="adjustment-quantity"
                type="number"
                min={1}
                value={quantity}
                disabled={isSubmitting}
                onChange={(event) => {
                  const value = Number(
                    event.target.value,
                  );

                  setQuantity(
                    Number.isNaN(value)
                      ? 0
                      : Math.max(0, value),
                  );
                }}
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-foreground
                  outline-none
                  transition
                  focus:border-[#0284c7]
                  focus:ring-2
                  focus:ring-[#0284c7]/20
                "
              />
            </div>

            {/* Preview */}
            <div className="mt-4 rounded-xl bg-[#0284c7]/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-text">
                  New stock
                </span>

                <span className="text-sm font-bold text-foreground">
                  {Math.max(
                    0,
                    (selectedProduct.inventory
                      ?.quantity_on_hand ?? 0) +
                      (adjustmentType === "increase"
                        ? quantity
                        : -quantity),
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAdjustment}
                disabled={isSubmitting}
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-muted-text
                  transition-colors
                  hover:text-foreground
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAdjustment}
                disabled={
                  isSubmitting || quantity <= 0
                }
                className="
                  rounded-xl
                  bg-[#0284c7]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-[#0369a1]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isSubmitting
                  ? "Updating..."
                  : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
