"use client"
import React from 'react';
import { AlertTriangle, ShoppingBag, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_NEEDS_ATTENTION } from "@/data/mockData";

export const NeedsAttentionCard: React.FC = () => {
  const getStyle = (type: string) => {
    switch (type) {
      case 'low_stock':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          bg: 'bg-amber-500/10 border-amber-500/20',
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        };
      case 'out_of_stock':
        return {
          icon: <ShoppingBag className="w-5 h-5 text-rose-500" />,
          bg: 'bg-rose-500/10 border-rose-500/20',
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
        };
      case 'pending_orders':
        return {
          icon: <Clock className="w-5 h-5 text-sky-500" />,
          bg: 'bg-sky-500/10 border-sky-500/20',
          badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
        };
      case 'payment_failures':
        return {
          icon: <CreditCard className="w-5 h-5 text-purple-500" />,
          bg: 'bg-purple-500/10 border-purple-500/20',
          badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#0284c7]" />,
          bg: 'bg-[#0284c7]/10 border-[#0284c7]/20',
          badge: 'bg-[#0284c7]/15 text-[#0284c7]',
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col h-full">
      <h3 className="text-base font-bold text-foreground tracking-tight mb-5">
        Needs Attention
      </h3>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {MOCK_NEEDS_ATTENTION.map((item, idx) => {
          const style = getStyle(item.type);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/60 hover:bg-border/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${style.bg} shrink-0 group-hover:scale-105 transition-transform`}
                >
                  {style.icon}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.badge}`}
                >
                  {item.count}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
