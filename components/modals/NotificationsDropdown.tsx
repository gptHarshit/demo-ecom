"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Bell, Loader2, X } from "lucide-react";

import {
  LOW_STOCK_THRESHOLD,
  useLowStockProducts,
} from "@/hooks/useLowStockProducts";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const { lowStockProducts, isLoading, error, reload } =
    useLowStockProducts();

  // Dismissed only for this viewing session — reappears next time stock is
  // still low and the dropdown is reopened fresh (no backend "read" state).
  const [dismissed, setDismissed] = useState(false);

  // Refetch every time the dropdown is opened, so counts stay current.
  useEffect(() => {
    if (isOpen) {
      setDismissed(false);
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const visible = dismissed ? [] : lowStockProducts;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 z-50 w-80 md:w-96 rounded-2xl border border-border bg-card shadow-2xl p-4 text-foreground"
        >
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0284c7]" />
              <span className="font-semibold text-sm">Low stock alerts</span>

              {visible.length > 0 && (
                <span className="bg-amber-500/15 text-amber-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {visible.length}
                </span>
              )}
            </div>

            {visible.length > 0 && (
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-muted-text hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-text">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking stock levels...
              </div>
            )}

            {!isLoading && error && (
              <p className="py-6 text-center text-xs text-red-500">
                {error}
              </p>
            )}

            {!isLoading && !error && visible.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-text">
                No products at or below {LOW_STOCK_THRESHOLD} in stock.
              </p>
            )}

            {!isLoading &&
              !error &&
              visible.map((product) => (
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.id}`}
                  onClick={onClose}
                  className="p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-border/30 transition-colors flex gap-3 items-start"
                >
                  <div className="p-2 rounded-lg bg-card border border-border shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {product.name}
                      </span>

                      <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        {product.quantityOnHand} left
                      </span>
                    </div>

                    <p className="text-xs text-muted-text mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};