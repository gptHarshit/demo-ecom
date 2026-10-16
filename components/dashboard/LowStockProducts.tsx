"use client";
import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { LowStockProduct } from "@/types/dashboard";
import { StockAdjustModal } from "@/components/modals/StockAdjustModal";

export const LowStockProducts: React.FC = () => {
  const { lowStockProducts, setActiveNav } = useTenant();
  const [selectedProduct, setSelectedProduct] =
    useState<LowStockProduct | null>(null);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Low Stock Products
        </h3>
        <button
          onClick={() => setActiveNav("Inventory")}
          className="text-xs font-semibold text-[#0284c7] hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {lowStockProducts.map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/60 hover:bg-border/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={prod.imageUrl}
                alt={prod.title}
                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-[150px]">
                  {prod.title}
                </span>
                <span className="text-[11px] text-muted-text font-mono">
                  {prod.sku}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-rose-500 shrink-0">
                {prod.stockLeft} left
              </span>
              <button
                onClick={() => setSelectedProduct(prod)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-[#0284c7] hover:text-white hover:border-[#0284c7] transition-all cursor-pointer shadow-2xs shrink-0"
              >
                Adjust
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <StockAdjustModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
