"use client";
import React from "react";
import { useTenant } from "@/context/TenantContext";
import { Order } from "@/types/dashboard";

export const RecentOrdersTable: React.FC = () => {
  const { orders, updateOrderStatus, setActiveNav } = useTenant();

  const getPaymentBadge = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "COD":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  const getFulfillmentBadge = (status: Order["fulfillmentStatus"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Shipped":
      case "Processing":
        return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "Pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col h-full">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Recent Orders
        </h3>
        <button
          onClick={() => setActiveNav("Orders")}
          className="text-xs font-semibold text-[#0284c7] hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-text font-medium">
              <th className="pb-3 pr-3 font-semibold">Order ID</th>
              <th className="pb-3 px-3 font-semibold">Customer</th>
              <th className="pb-3 px-3 font-semibold">Amount</th>
              <th className="pb-3 px-3 font-semibold">Payment</th>
              <th className="pb-3 px-3 font-semibold">Fulfillment</th>
              <th className="pb-3 pl-3 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-background/60 transition-colors group"
              >
                <td className="py-3.5 pr-3 font-bold text-[#0284c7] cursor-pointer hover:underline">
                  {order.orderNumber}
                </td>
                <td className="py-3.5 px-3 font-medium text-foreground">
                  {order.customerName}
                </td>
                <td className="py-3.5 px-3 font-semibold text-foreground">
                  {order.amount}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPaymentBadge(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <select
                    value={order.fulfillmentStatus}
                    onChange={(e) =>
                      updateOrderStatus(
                        order.id,
                        e.target.value as Order["fulfillmentStatus"],
                      )
                    }
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer outline-none bg-transparent ${getFulfillmentBadge(
                      order.fulfillmentStatus,
                    )}`}
                  >
                    <option
                      value="Processing"
                      className="bg-card text-foreground"
                    >
                      Processing
                    </option>
                    <option
                      value="Shipped"
                      className="bg-card text-foreground"
                    >
                      Shipped
                    </option>
                    <option
                      value="Delivered"
                      className="bg-card text-foreground"
                    >
                      Delivered
                    </option>
                    <option
                      value="Pending"
                      className="bg-card text-foreground"
                    >
                      Pending
                    </option>
                  </select>
                </td>
                <td className="py-3.5 pl-3 text-right text-muted-text font-medium">
                  {order.timeAgo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
