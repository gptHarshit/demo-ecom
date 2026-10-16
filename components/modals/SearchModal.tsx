"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, orders, lowStockProducts } =
    useTenant();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredProducts = lowStockProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
            <Search className="w-5 h-5 text-[#0284c7] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, customers, or products..."
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-text"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-muted-text hover:text-foreground"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-md text-muted-text hover:bg-border/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {/* Orders Section */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-text uppercase tracking-wider mb-2">
                <ShoppingBag className="w-3.5 h-3.5" /> Recent Orders (
                {filteredOrders.length})
              </div>
              <div className="space-y-1">
                {filteredOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-border/30 transition-colors cursor-pointer group"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#0284c7]">
                        {order.orderNumber}
                      </span>
                      <span className="text-sm text-foreground font-medium">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-text">
                        {order.amount}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-text group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-text uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5" /> Products (
                {filteredProducts.length})
              </div>
              <div className="space-y-1">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-border/30 transition-colors cursor-pointer group"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-8 h-8 rounded-lg object-cover border border-border"
                      />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {prod.title}
                        </div>
                        <div className="text-[11px] text-muted-text">
                          {prod.sku}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-500">
                      {prod.stockLeft} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-background/50 border-t border-border text-[11px] text-muted-text flex justify-between">
            <span>Navigation: ↑ ↓ Select | Enter Open</span>
            <span>ESC to close</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
