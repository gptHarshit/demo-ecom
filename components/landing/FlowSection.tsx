'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  AlertCircle,
  PackageX,
  CheckCircle2,
  Box,
  TrendingUp,
  Store,
  Globe,
  Zap,
  AlertTriangle,
} from 'lucide-react';

export default function FlowSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Background color transition (Sky 400 to White)
  const { resolvedTheme } = useTheme();

const boxBgColor = useTransform(
  scrollYProgress,
  [0, 0.45, 0.55, 1],
  [
    "#38bdf8",
    "#38bdf8",
    resolvedTheme === "dark" ? "#020617" : "#ffffff",
    resolvedTheme === "dark" ? "#020617" : "#ffffff",
  ]
);

  const boxBorderColor = useTransform(
    scrollYProgress,
    [0, 0.45, 0.55, 1],
    ['#7dd3fc', '#7dd3fc', '#e0f2fe', '#e0f2fe'] // sky-300 to sky-100
  );

  // --- PART 1: The Chaos ---
  const text1Opacity = useTransform(scrollYProgress, [0, 0.05, 0.4, 0.45], [0, 1, 1, 0]);
  const text1Scale = useTransform(scrollYProgress, [0, 0.05, 0.4, 0.45], [0.9, 1, 1, 1.05]);

  // Chaos Cards Animations
  const c1Opacity = useTransform(scrollYProgress, [0.1, 0.15, 0.35, 0.4], [0, 1, 1, 0]);
  const c1Y = useTransform(scrollYProgress, [0.1, 0.15, 0.35, 0.4], [50, 0, 0, -50]);

  const c2Opacity = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const c2Y = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [50, 0, 0, -50]);

  const c3Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  const c3Y = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [50, 0, 0, -50]);

  const c4Opacity = useTransform(scrollYProgress, [0.25, 0.3, 0.35, 0.4], [0, 1, 1, 0]);
  const c4Y = useTransform(scrollYProgress, [0.25, 0.3, 0.35, 0.4], [50, 0, 0, -50]);

  // --- PART 2: The Order ---
  const text2Opacity = useTransform(scrollYProgress, [0.55, 0.6, 0.95, 1], [0, 1, 1, 0]);
  const text2Scale = useTransform(scrollYProgress, [0.55, 0.6, 0.95, 1], [0.9, 1, 1, 1.05]);

  // Order Cards Animations
  const o1Opacity = useTransform(scrollYProgress, [0.65, 0.7, 0.9, 0.95], [0, 1, 1, 0]);
  const o1Y = useTransform(scrollYProgress, [0.65, 0.7, 0.9, 0.95], [50, 0, 0, -50]);

  const o2Opacity = useTransform(scrollYProgress, [0.7, 0.75, 0.9, 0.95], [0, 1, 1, 0]);
  const o2Y = useTransform(scrollYProgress, [0.7, 0.75, 0.9, 0.95], [50, 0, 0, -50]);

  const o3Opacity = useTransform(scrollYProgress, [0.75, 0.8, 0.9, 0.95], [0, 1, 1, 0]);
  const o3Y = useTransform(scrollYProgress, [0.75, 0.8, 0.9, 0.95], [50, 0, 0, -50]);

  const o4Opacity = useTransform(scrollYProgress, [0.8, 0.85, 0.9, 0.95], [0, 1, 1, 0]);
  const o4Y = useTransform(scrollYProgress, [0.8, 0.85, 0.9, 0.95], [50, 0, 0, -50]);

  return (
    <section ref={containerRef} className="h-[400vh] relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
        
        {/* Main Morphing Box */}
        <motion.div
          style={{ backgroundColor: boxBgColor, borderColor: boxBorderColor }}
          className="w-full max-w-6xl h-[80vh] rounded-[6rem] md:rounded-[4rem] relative overflow-hidden shadow-2xl shadow-sky-900/10 border-4"
        >
          {/* --- CENTRAL TEXT: PART 1 --- */}
          <motion.div
            style={{ opacity: text1Opacity, scale: text1Scale }}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <div className="max-w-xl lg:max-w-2xl px-6 text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Running an online store means juggling thousands of orders,{' '}
                <span className="text-sky-950 block mt-2">
                  but syncing inventory is a chaotic mess.
                </span>
              </h2>
            </div>
          </motion.div>

          {/* --- FLOATING CARDS: PART 1 (Chaos) --- */}
          <motion.div style={{ opacity: c1Opacity, y: c1Y }} className="absolute top-[8%] lg:top-[12%] left-[4%] lg:left-[6%] z-20 hidden md:block">
            <ChaosProductCard />
          </motion.div>

          <motion.div style={{ opacity: c2Opacity, y: c2Y }} className="absolute bottom-[8%] lg:bottom-[12%] right-[4%] lg:right-[6%] z-20 hidden md:block">
            <ChaosSyncCard />
          </motion.div>

          <motion.div style={{ opacity: c3Opacity, y: c3Y }} className="absolute top-[12%] lg:top-[16%] right-[4%] lg:right-[6%] z-20 hidden lg:block">
            <ChaosOrderCard />
          </motion.div>

          <motion.div style={{ opacity: c4Opacity, y: c4Y }} className="absolute bottom-[12%] lg:bottom-[16%] left-[4%] lg:left-[6%] z-20 hidden lg:block">
            <ChaosAlertCard />
          </motion.div>


          {/* --- CENTRAL TEXT: PART 2 --- */}
          <motion.div
            style={{ opacity: text2Opacity, scale: text2Scale }}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <div className="max-w-xl lg:max-w-2xl px-6 text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                MyLeadKart orchestrates your operations in real time,{' '}
                <span className="text-sky-500 block mt-2">
                  adding structure and accuracy to every channel.
                </span>
              </h2>
            </div>
          </motion.div>

          {/* --- FLOATING CARDS: PART 2 (Order) --- */}
          <motion.div style={{ opacity: o1Opacity, y: o1Y }} className="absolute top-[8%] lg:top-[12%] left-[4%] lg:left-[6%] z-20 hidden md:block">
            <OrderProductCard />
          </motion.div>

          <motion.div style={{ opacity: o2Opacity, y: o2Y }} className="absolute bottom-[8%] lg:bottom-[12%] right-[4%] lg:right-[6%] z-20 hidden md:block">
            <OrderFulfillCard />
          </motion.div>

          <motion.div style={{ opacity: o3Opacity, y: o3Y }} className="absolute top-[12%] lg:top-[16%] right-[4%] lg:right-[6%] z-20 hidden lg:block">
            <OrderAnalyticsCard />
          </motion.div>

          <motion.div style={{ opacity: o4Opacity, y: o4Y }} className="absolute bottom-[12%] lg:bottom-[16%] left-[4%] lg:left-[6%] z-20 hidden lg:block">
            <OrderSyncCard />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

// --- SUB-COMPONENTS: PART 1 (CHAOS) ---

function ChaosProductCard() {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-xl min-w-[240px] max-w-[260px]">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
          <PackageX className="text-slate-500 w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Premium Headphones</p>
          <p className="text-xs text-slate-500 font-medium">SKU: HD-9021</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 flex items-start gap-2">
        <AlertCircle className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700">Oversold across channels</p>
          <p className="text-[10px] font-medium text-amber-600 mt-0.5">-12 items in inventory</p>
        </div>
      </div>
    </div>
  );
}

function ChaosSyncCard() {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-white/40 p-5 rounded-2xl shadow-xl min-w-[240px]">
      <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Channel Sync</p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center">
            <Store className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-[10px] font-semibold text-slate-500">Storefront</span>
        </div>
        <div className="flex-1 flex justify-center border-t-2 border-dashed border-amber-300 relative">
           <div className="absolute -top-2.5 bg-white px-1 rounded-full">
             <AlertTriangle className="w-4 h-4 text-amber-500" />
           </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center">
             <Globe className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-[10px] font-semibold text-slate-500">Marketplace</span>
        </div>
      </div>
      <p className="text-xs font-medium text-center text-amber-600 mt-4">Last sync: 2 hours ago</p>
    </div>
  );
}

function ChaosOrderCard() {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-xl min-w-[220px]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-slate-800">Order #8922</span>
        <span className="bg-amber-100 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold">Delayed</span>
      </div>
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
           <div className="h-full bg-amber-400 w-1/3 rounded-full"></div>
        </div>
        <p className="text-xs font-medium text-slate-500">Waiting on inventory manual check.</p>
      </div>
    </div>
  );
}

function ChaosAlertCard() {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-amber-200 p-4 rounded-2xl shadow-xl min-w-[240px] flex items-start gap-3">
       <div className="mt-1">
         <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
       </div>
       <div>
         <p className="text-sm font-bold text-slate-800">Stock Discrepancy</p>
         <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Warehouse B reports 0 items, but website shows 5 available.</p>
       </div>
    </div>
  );
}

// --- SUB-COMPONENTS: PART 2 (ORDER) ---

function OrderProductCard() {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] min-w-[240px] max-w-[260px]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center shrink-0 border border-sky-100">
            <Box className="text-sky-600 w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Premium Headphones</p>
            <p className="text-xs font-medium text-slate-500">SKU: HD-9021</p>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-600">Available Quantity</span>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">IN STOCK</span>
          <span className="text-sm font-black text-slate-900">450</span>
        </div>
      </div>
    </div>
  );
}

function OrderFulfillCard() {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] min-w-[240px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle2 className="text-emerald-600 w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Order #8923</p>
          <p className="text-xs text-emerald-600 font-bold">Auto-Fulfilled</p>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-500">Routing</span>
          <span className="font-bold text-slate-900">Nearest Warehouse</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-500">Carrier</span>
          <span className="font-bold text-slate-900">FedEx 2-Day</span>
        </div>
      </div>
    </div>
  );
}

function OrderAnalyticsCard() {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-sky-600" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Volume</span>
      </div>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-black text-slate-900">1,204</span>
        <span className="text-xs text-emerald-600 font-bold mb-1 bg-emerald-50 px-1.5 py-0.5 rounded">+12.5%</span>
      </div>
      <div className="h-12 w-full flex items-end gap-1">
        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
          <div key={i} className="flex-1 bg-sky-50 rounded-t-sm" style={{ height: `${h}%` }}>
            <div className="w-full bg-sky-400 rounded-t-sm transition-all" style={{ height: `${h * 0.8}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderSyncCard() {
  return (
    <div className="bg-sky-500 border border-sky-400 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)] min-w-[240px] max-w-[260px] text-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-bold">Universal Sync Live</p>
      </div>
      <p className="text-xs font-medium text-sky-50 leading-relaxed">
        1 update in MyLeadKart instantly pushed to Shopify, Amazon, and WooCommerce.
      </p>
    </div>
  );
}
