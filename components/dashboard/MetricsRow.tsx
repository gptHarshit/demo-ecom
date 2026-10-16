"use client";
import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "motion/react";
import { MOCK_METRICS } from "@/data/mockData";

export const MetricsRow: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case "sales":
        return <DollarSign className="w-5 h-5 text-[#0284c7]" />;
      case "orders":
        return <ShoppingBag className="w-5 h-5 text-[#0284c7]" />;
      case "customers":
        return <Users className="w-5 h-5 text-[#0284c7]" />;
      case "inventory":
        return <Package className="w-5 h-5 text-[#0284c7]" />;
      default:
        return <DollarSign className="w-5 h-5 text-[#0284c7]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {MOCK_METRICS.map((metric, idx) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-[#0284c7]/40 transition-all group relative overflow-hidden"
        >
          {/* Top Row: Title + Icon */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-text">
              {metric.title}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 border border-[#0284c7]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getIcon(metric.iconType)}
            </div>
          </div>

          {/* Big Metric Value */}
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {metric.value}
          </div>

          {/* Trend & Timeframe */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`flex items-center gap-0.5 ${
                metric.isPositive ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {metric.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {metric.trend}
            </span>
            <span className="text-muted-text font-normal">
              {metric.timeframe}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
