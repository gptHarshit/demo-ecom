"use client";

import React from "react";
import {
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import {
  InventoryFilters as InventoryFiltersType,
  InventoryQuantityFilter,
  InventoryStockStatus,
} from "@/types/inventory";

interface InventoryFiltersProps {
  filters: InventoryFiltersType;
  onChange: (
    filters: InventoryFiltersType,
  ) => void;
  onReset: () => void;
}

export const InventoryFilters: React.FC<
  InventoryFiltersProps
> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleStockStatusChange = (
    value: InventoryStockStatus | "all",
  ) => {
    onChange({
      ...filters,
      stockStatus: value,
    });
  };

  const handleQuantityChange = (
    value: InventoryQuantityFilter,
  ) => {
    onChange({
      ...filters,
      quantity: value,
    });
  };

  const hasActiveFilters =
    filters.stockStatus !== "all" ||
    filters.quantity !== "all";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Filters
            </p>

            <p className="text-xs text-muted-text">
              Refine your inventory view
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-2.5
              py-1.5
              text-xs
              font-semibold
              text-muted-text
              transition
              hover:bg-border/30
              hover:text-foreground
            "
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="stock-status"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Stock status
          </label>

          <select
            id="stock-status"
            value={filters.stockStatus}
            onChange={(event) =>
              handleStockStatusChange(
                event.target.value as
                  | InventoryStockStatus
                  | "all",
              )
            }
            className="
              h-11
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-3
              text-sm
              text-foreground
              outline-none
              transition
              focus:border-[#0284c7]
              focus:ring-2
              focus:ring-[#0284c7]/10
            "
          >
            <option value="all">All stock</option>
            <option value="in-stock">
              In stock
            </option>
            <option value="low-stock">
              Low stock
            </option>
            <option value="out-of-stock">
              Out of stock
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="quantity-filter"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Quantity
          </label>

          <select
            id="quantity-filter"
            value={filters.quantity}
            onChange={(event) =>
              handleQuantityChange(
                event.target.value as InventoryQuantityFilter,
              )
            }
            className="
              h-11
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-3
              text-sm
              text-foreground
              outline-none
              transition
              focus:border-[#0284c7]
              focus:ring-2
              focus:ring-[#0284c7]/10
            "
          >
            <option value="all">
              All quantities
            </option>

            <option value="out-of-stock">
              0 units
            </option>

            <option value="low-stock">
              1 – 10 units
            </option>

            <option value="in-stock">
              11+ units
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};