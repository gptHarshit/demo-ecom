"use client";

import React, { useState } from "react";
import { Boxes, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-3 space-y-2 flex flex-col items-end"
          >
            <button
              onClick={() => {
                alert("Quick Action: Refreshing tenant analytics...");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-lg hover:bg-border/40 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0284c7]" /> Refresh
              Metrics
            </button>
            <button
              onClick={() => {
                alert("Quick Action: Generating Store Report...");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-lg hover:bg-border/40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" /> Generate Store
              Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#0284c7] hover:bg-sky-600 text-white flex items-center justify-center shadow-xl shadow-sky-500/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        title="Quick Actions"
      >
        <Boxes className="w-6 h-6" />
      </button>
    </div>
  );
};
