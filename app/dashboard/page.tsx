"use client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { SalesOverviewChart } from "@/components/dashboard/SalesOverviewChart";
import { NeedsAttentionCard } from "@/components/dashboard/NeedsAttentionCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { LowStockProducts } from "@/components/dashboard/LowStockProducts";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      <MetricsRow />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesOverviewChart />
        </div>

        <div>
          <NeedsAttentionCard />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable />
        </div>

        <div>
          <LowStockProducts />
        </div>
      </div>

      <div className="mt-6">
        <RecentActivityFeed />
      </div>
    </>
  );
}