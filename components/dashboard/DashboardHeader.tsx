"use client";
import React, { useState } from "react";
import { Calendar, ChevronDown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
// import { useTenant } from "@/context/TenantContext";
import { useUser } from "@/context/UserContext";

export const DashboardHeader: React.FC = () => {
  const { user, business } = useUser();
  const [dateRange, setDateRange] = useState("Jul 22 – Jul 28, 2024");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const ranges = [
    "Jul 22 – Jul 28, 2024",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Year to Date",
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Greeting & Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          Good morning, {user?.name ?? "Loading..."}!{" "}
          <span className="animate-bounce inline-block">👋</span>
        </h2>
        <p className="text-sm text-muted-text mt-1 font-medium">
          Here's what's happening with{" "}
          <span className="text-[#0284c7] font-semibold">
            {business?.name ?? "Loading..."}
          </span>{" "}
          today.
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-bordborder-border/30 text-sm font-medium text-foreground shadow-xs transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-muted-text" />
          <span>{dateRange}</span>
          <ChevronDown
            className={`w-4 h-4 text-muted-text transition-transform duration-200 ${isDatePickerOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isDatePickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-border bg-card shadow-xl p-1.5 space-y-1"
          >
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  setIsDatePickerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? "bg-[#0284c7]/10 text-[#0284c7]"
                    : "text-foreground hover:bg-bordborder-border/40"
                }`}
              >
                {range}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
