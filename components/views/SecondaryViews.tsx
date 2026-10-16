"use client";

import React from "react";
import { useTenant } from "@/context/TenantContext";
import { Settings, Plus } from "lucide-react";

export const SecondaryViews: React.FC = () => {
  const { activeNav, orders, lowStockProducts, activeTenant } = useTenant();

  if (activeNav === "Products") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Product Catalog
            </h2>
            <p className="text-sm text-muted-text">
              Manage items across store locations for {activeTenant?.name}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-sky-600">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lowStockProducts.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl border border-border bg-card space-y-3"
            >
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-36 object-cover rounded-xl border border-border"
              />
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {p.title}
                </h4>
                <p className="text-xs text-muted-text">{p.sku}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className="font-semibold text-emerald-500">$49.99</span>
                <span className="text-rose-500 font-bold">
                  {p.stockLeft} in stock
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeNav === "Orders") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Store Orders
            </h2>
            <p className="text-sm text-muted-text">
              All customer transactions and status updates
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-text font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-background/50">
                    <td className="py-3.5 font-bold text-[#0284c7]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 font-semibold text-foreground">
                      {o.customerName}
                    </td>
                    <td className="py-3.5 text-muted-text">
                      {o.customerEmail}
                    </td>
                    <td className="py-3.5 font-bold text-foreground">
                      {o.amount}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-500">
                        {o.fulfillmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl border border-border bg-card text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[#0284c7]/10 border border-[#0284c7]/20 flex items-center justify-center mx-auto text-[#0284c7]">
        <Settings className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">
        {activeNav} Module
      </h3>
      <p className="text-sm text-muted-text max-w-md mx-auto">
        Multi-tenant configuration panel for {activeTenant?.name}. All tenant
        scopes and user permissions are synchronized.
      </p>
    </div>
  );
};
