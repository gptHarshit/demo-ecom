"use client";

import React from "react";
import { Box, ShoppingCart, ShoppingBag, Truck, User } from "lucide-react";
import { MOCK_ACTIVITIES } from "@/data/mockData";

export const RecentActivityFeed: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case "stock_adjusted":
        return <Box className="w-4 h-4 text-muted-text" />;
      case "order_received":
        return <ShoppingCart className="w-4 h-4 text-muted-text" />;
      case "product_added":
        return <ShoppingBag className="w-4 h-4 text-muted-text" />;
      case "order_shipped":
        return <Truck className="w-4 h-4 text-muted-text" />;
      case "customer_created":
        return <User className="w-4 h-4 text-muted-text" />;
      default:
        return <Box className="w-4 h-4 text-muted-text" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col h-full">
      {/* Header */}
      <h3 className="text-base font-bold text-foreground tracking-tight mb-4">
        Recent Activity
      </h3>

      {/* Activity Timeline List */}
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {MOCK_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between text-xs py-1 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-border bg-background shrink-0">
                {getIcon(activity.type)}
              </div>
              <span className="font-semibold text-foreground">
                {activity.title}
              </span>
            </div>
            <span className="text-muted-text font-medium text-[11px] shrink-0">
              {activity.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
