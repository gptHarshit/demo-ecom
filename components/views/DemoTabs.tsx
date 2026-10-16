"use client";

import React from "react";
import { DemoScreen } from "@/types/demo";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface DemoTabsProps {
  tabs: DemoScreen[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const DemoTabs: React.FC<DemoTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Demo Screens"
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide rounded-2xl border border-border bg-card p-2"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`relative cursor-pointer whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
              isActive
                ? "text-white"
                : "text-foreground hover:bg-border/40"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-demo-tab"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
                className="absolute inset-0 rounded-xl bg-accent"
              />
            )}

            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default DemoTabs;
