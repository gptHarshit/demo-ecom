"use client";

import React from "react";
import {
  BarChart3,
  Plus,
  Package,
} from "lucide-react";

interface InventoryHeaderProps {
  onAddProduct: () => void;
  onShowAnalytics: () => void;
}

export const InventoryHeader: React.FC<
  InventoryHeaderProps
> = ({
  onAddProduct,
  onShowAnalytics,
}) => {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-text">
          <Package className="h-4 w-4" />
          Operations
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Inventory Management
        </h1>

        <p className="mt-1.5 text-sm text-muted-text">
          Track stock levels, availability and inventory health.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onShowAnalytics}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-border
            bg-card
            px-4
            py-2.5
            text-sm
            font-semibold
            text-foreground
            shadow-sm
            transition-all
            hover:bg-border/30
            hover:border-[#0284c7]/30
          "
        >
          <BarChart3 className="h-4 w-4 text-[#0284c7]" />
          Analytics
        </button>

        {/* <button
          type="button"
          onClick={onAddProduct}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-[#0284c7]
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            shadow-sky-500/20
            transition-all
            hover:bg-[#0369a1]
            active:scale-[0.98]
          "
        >
          <Plus className="h-4 w-4" />
          Add product
        </button> */}
      </div>
    </div>
  );
};