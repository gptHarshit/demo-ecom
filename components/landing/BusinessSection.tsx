"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingCart, Store, Layers, Users, 
  Package, Receipt, Box, Code, Globe, 
  Truck, PieChart, UserCircle, Hexagon,
  CreditCard, Tag, ArrowRightLeft, ScanLine
} from "lucide-react";

const tabsData = [
  {
    id: "online-store",
    title: "Online Store",
    icon: ShoppingCart,
    description: "Power your online storefront with a robust backend. Manage products, orders, payments and customers from one central hub.",
    features: [
      { icon: Package, text: "Product Management" },
      { icon: Users, text: "Customer Management" },
      { icon: ShoppingCart, text: "Order Management" },
      { icon: Tag, text: "Coupons & Discounts" },
      { icon: CreditCard, text: "Payment Integration" },
      { icon: ArrowRightLeft, text: "Inventory Sync" },
      { icon: Truck, text: "Shipping & Tracking" },
      { icon: Code, text: "API Access" },
    ],
    nodes: [
      { id: 'customer', label: 'Customer', icon: UserCircle, x: 150, y: 300, color: 'text-purple-400' },
      { id: 'website', label: 'Website', icon: Globe, x: 350, y: 300, color: 'text-purple-400' },
      { id: 'api', label: 'API', icon: Code, x: 550, y: 300, color: 'text-purple-400' },
      { id: 'core', label: 'Commerce Core', isCore: true, x: 800, y: 300 },
      { id: 'warehouse', label: 'Warehouse', icon: Package, x: 1050, y: 150, color: 'text-blue-400' },
      { id: 'tracking', label: 'Tracking', icon: Truck, x: 1050, y: 450, color: 'text-blue-400' },
    ],
    links: [
      { from: 'customer', to: 'website' },
      { from: 'website', to: 'api' },
      { from: 'api', to: 'core' },
      { from: 'core', to: 'warehouse' },
      { from: 'core', to: 'tracking' },
    ]
  },
  {
    id: "offline-retail",
    title: "Offline Retail",
    icon: Store,
    description: "Run your physical store with blazing fast POS, barcode scanning, stock management and real-time reporting.",
    features: [
      { icon: Receipt, text: "POS Billing" },
      { icon: Box, text: "Inventory Control" },
      { icon: ScanLine, text: "Barcode Scanning" },
      { icon: Users, text: "Employee Roles" },
      { icon: ArrowRightLeft, text: "Stock Transfer" },
      { icon: PieChart, text: "Reports & Analytics" },
    ],
    nodes: [
      { id: 'customer', label: 'Customer', icon: UserCircle, x: 200, y: 300, color: 'text-blue-400' },
      { id: 'pos', label: 'POS', icon: Store, x: 450, y: 300, color: 'text-blue-400' },
      { id: 'core', label: 'Commerce Core', isCore: true, x: 750, y: 300 },
      { id: 'inventory', label: 'Inventory', icon: Box, x: 1050, y: 150, color: 'text-emerald-400' },
      { id: 'receipt', label: 'Receipt', icon: Receipt, x: 1050, y: 450, color: 'text-emerald-400' },
    ],
    links: [
      { from: 'customer', to: 'pos' },
      { from: 'pos', to: 'core' },
      { from: 'core', to: 'inventory' },
      { from: 'core', to: 'receipt' },
    ]
  },
  {
    id: "hybrid-commerce",
    title: "Hybrid Commerce",
    icon: ArrowRightLeft,
    description: "Unify your physical and digital presence. BOPIS (Buy Online, Pick Up In Store), unified loyalty, and synchronized inventory.",
    features: [
      { icon: Store, text: "BOPIS / Click & Collect" },
      { icon: ArrowRightLeft, text: "Omnichannel Sync" },
      { icon: Users, text: "Unified Customer Profiles" },
      { icon: Package, text: "Ship from Store" },
    ],
    nodes: [
      { id: 'online', label: 'Online Store', icon: Globe, x: 200, y: 150, color: 'text-purple-400' },
      { id: 'pos', label: 'Retail POS', icon: Store, x: 200, y: 450, color: 'text-blue-400' },
      { id: 'api', label: 'Unified API', icon: Code, x: 450, y: 300, color: 'text-indigo-400' },
      { id: 'core', label: 'Commerce Core', isCore: true, x: 750, y: 300 },
      { id: 'fulfillment', label: 'Fulfillment', icon: Package, x: 1050, y: 300, color: 'text-emerald-400' },
    ],
    links: [
      { from: 'online', to: 'api' },
      { from: 'pos', to: 'api' },
      { from: 'api', to: 'core' },
      { from: 'core', to: 'fulfillment' },
    ]
  },
  {
    id: "agencies-partners",
    title: "Agencies & Partners",
    icon: Layers,
    description: "Manage multiple client projects, access granular controls, and deploy standardized commerce architectures rapidly.",
    features: [
      { icon: Layers, text: "Multi-tenant Dashboard" },
      { icon: Code, text: "Headless SDKs" },
      { icon: Users, text: "Client Access Control" },
      { icon: PieChart, text: "Aggregated Analytics" },
    ],
    nodes: [
      { id: 'client1', label: 'Client A', icon: Store, x: 150, y: 100, color: 'text-amber-400' },
      { id: 'client2', label: 'Client B', icon: Globe, x: 150, y: 300, color: 'text-blue-400' },
      { id: 'client3', label: 'Client C', icon: ShoppingCart, x: 150, y: 500, color: 'text-emerald-400' },
      { id: 'dashboard', label: 'Agency Hub', icon: Layers, x: 450, y: 300, color: 'text-purple-400' },
      { id: 'core', label: 'Commerce Core', isCore: true, x: 750, y: 300 },
      { id: 'analytics', label: 'Analytics', icon: PieChart, x: 1050, y: 300, color: 'text-indigo-400' },
    ],
    links: [
      { from: 'client1', to: 'dashboard' },
      { from: 'client2', to: 'dashboard' },
      { from: 'client3', to: 'dashboard' },
      { from: 'dashboard', to: 'core' },
      { from: 'core', to: 'analytics' },
    ]
  }
];

function getBezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1);
  const controlOffset = dx * 0.4;
  return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
}

function FlowVisual({ nodes, links }: { nodes: any[], links: any[] }) {
  const coreNode = nodes.find(n => n.isCore);
  
  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-8">
      <div className="relative min-w-[800px] w-full aspect-[2/1] overflow-visible">
        <svg viewBox="0 0 1200 600" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl" preserveAspectRatio="none">
            {/* Ripples emanating from core */}
            {coreNode && (
              <g transform={`translate(${coreNode.x}, ${coreNode.y})`}>
                <circle r="120" fill="none" stroke="currentColor" className="text-blue-500/20" strokeWidth="1" />
                <circle r="250" fill="none" stroke="currentColor" className="text-blue-500/10" strokeWidth="1" strokeDasharray="4 8" />
                <circle r="400" fill="none" stroke="currentColor" className="text-blue-500/5" strokeWidth="1" />
              </g>
            )}

            <AnimatePresence>
              {links.map((link, i) => {
                const fromNode = nodes.find(n => n.id === link.from);
                const toNode = nodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return null;
                const path = getBezierPath(fromNode.x, fromNode.y, toNode.x, toNode.y);
                const linkId = `${link.from}-${link.to}`;
                return (
                  <motion.g 
                    key={linkId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-border dark:text-blue-500/20" />
                    <motion.path 
                      d={path} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="text-blue-500 dark:text-blue-400" 
                      strokeDasharray="4 12"
                      animate={{ strokeDashoffset: [0, -16] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.6))' }}
                    />
                    <circle r="4" fill="currentColor" className="text-blue-300 shadow-[0_0_10px_rgba(147,197,253,1)]">
                      <animateMotion dur={`${2 + (i % 3) * 0.5}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  </motion.g>
                );
              })}
            </AnimatePresence>
        </svg>

        <AnimatePresence>
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 100, damping: 15, mass: 0.8 }}
              style={{
                position: 'absolute',
                left: `${(node.x / 1200) * 100}%`,
                top: `${(node.y / 600) * 100}%`,
                x: '-50%',
                y: '-50%'
              }}
              className="pointer-events-auto flex flex-col items-center z-10"
            >
              {node.isCore ? (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-accent flex flex-col items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] border border-blue-400/30 backdrop-blur-xl transition-transform hover:scale-105 relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-[2rem] animate-pulse" />
                  <Hexagon className="w-12 h-12 md:w-16 md:h-16 text-white mb-2 relative z-10" />
                  <span className="text-white font-bold text-[12px] md:text-base leading-tight text-center relative z-10">Commerce<br/>Core</span>
                </div>
              ) : (
                <div className="flex flex-col items-center group transition-transform hover:scale-110">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-[#0a0f1e]/90 border border-white/10 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors group-hover:border-blue-500/50 backdrop-blur-md">
                    <node.icon className={`w-6 h-6 md:w-8 md:h-8 mb-2 ${node.color}`} />
                    <span className="text-[10px] md:text-xs font-medium text-white/90 text-center leading-tight">
                      {node.label}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function BusinessModelsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const activeData = tabsData[activeTab];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabsData.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-[1400px] relative z-10">
        
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Built for <span className="text-transparent bg-clip-text bg-accent">every business.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-foreground/70 font-light"
          >
            Whether you&apos;re a digital-native brand, a sprawling retail chain, or an agency building for clients, MyLeadKart adapts to your operational topology.
          </motion.p>
        </div>

        {/* Tabs Selection (Capsule) */}
        <div className="flex justify-center mb-16 overflow-x-auto hide-scrollbar px-2">
           <div className="inline-flex items-center gap-2 p-1.5 bg-card/50 backdrop-blur-md border border-border rounded-full flex-nowrap whitespace-nowrap snap-x snap-mandatory">
              {tabsData.map((tab, idx) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm md:text-base font-semibold transition-all snap-center ${
                    activeTab === idx 
                      ? 'bg-foreground text-background shadow-lg' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === idx ? 'text-background' : 'text-blue-500'}`} />
                  <span>{tab.title}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Content Area */}
        <div 
           className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center"
           onMouseEnter={() => setIsPaused(true)}
           onMouseLeave={() => setIsPaused(false)}
        >
          
          {/* Left Content */}
          <div className="w-full lg:w-[35%] flex flex-col">
             
            <AnimatePresence mode="wait">
              <motion.div
                key={activeData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-card/60 to-card/20 border border-border rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl"
              >
                <p className="text-base lg:text-lg text-foreground/80 leading-relaxed mb-8 font-light">
                  {activeData.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border shadow-sm hover:border-blue-500/30 transition-colors">
                      <feature.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground/90 truncate">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Visual (Open Canvas without bounding box) */}
          <div className="w-full lg:w-[65%] flex items-center justify-center">
             <FlowVisual nodes={activeData.nodes} links={activeData.links} />
          </div>

        </div>

      </div>
    </section>
  );
}
