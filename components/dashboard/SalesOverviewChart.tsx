"use client";
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, MoreHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { MOCK_SALES_7D, MOCK_SALES_30D, MOCK_SALES_90D } from "@/data/mockData";

export const SalesOverviewChart: React.FC = () => {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("7D");

  const getData = () => {
    switch (timeframe) {
      case "30D":
        return MOCK_SALES_30D;
      case "90D":
        return MOCK_SALES_90D;
      default:
        return MOCK_SALES_7D;
    }
  };

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const strokeColor = "#0284c7";

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Sales Overview
          </h3>
          <Info className="w-4 h-4 text-muted-text cursor-pointer hover:text-foreground transition-colors" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-background border border-border">
            {(["7D", "30D", "90D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeframe === tf
                    ? "bg-[#0284c7] text-white shadow-xs"
                    : "text-muted-text hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button className="p-1.5 rounded-lg border border-border bg-background text-muted-text hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-64 sm:h-72 mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={getData()}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) =>
                `$${val >= 1000 ? `${val / 1000}K` : val}`
              }
              domain={[0, "dataMax + 1000"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 rounded-xl border border-border bg-card shadow-xl text-xs space-y-1">
                      <div className="font-medium text-muted-text">
                        {data.date}
                      </div>
                      <div className="text-sm font-bold text-[#0284c7]">
                        {data.formattedAmount}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#salesGradient)"
              dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{
                r: 6,
                fill: "#0284c7",
                strokeWidth: 3,
                stroke: "#ffffff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
