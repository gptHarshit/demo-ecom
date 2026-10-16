import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, PackageCheck } from "lucide-react";
import { LowStockProduct } from "@/types/dashboard";
import { useTenant } from "@/context/TenantContext";

interface StockAdjustModalProps {
  product: LowStockProduct | null;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  onClose,
}) => {
  if (!product) return null;

  const { adjustStock } = useTenant();
  const [amount, setAmount] = useState(product.stockLeft);

  const handleSave = () => {
    adjustStock(product.id, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#0284c7]" />
              Adjust Inventory Stock
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-text hover:bg-border/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-background border border-border">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-14 h-14 rounded-lg object-cover border border-border"
            />
            <div>
              <div className="font-bold text-sm text-foreground">
                {product.title}
              </div>
              <div className="text-xs text-muted-text">
                {product.sku}
              </div>
              <div className="text-xs text-[#0284c7] font-semibold mt-1">
                Current Stock: {product.stockLeft} units
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold text-muted-text uppercase tracking-wider">
              Set New Quantity
            </label>
            <div className="flex items-center justify-between p-2 rounded-xl border border-border bg-background">
              <button
                onClick={() => setAmount(Math.max(0, amount - 1))}
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-border/30 font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-extrabold text-foreground">
                {amount}
              </span>
              <button
                onClick={() => setAmount(amount + 1)}
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-border/30 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-muted-text hover:bg-border/30"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-sky-600 shadow-sm"
            >
              Update Stock
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
