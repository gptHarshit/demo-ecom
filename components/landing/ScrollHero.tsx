"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ShoppingBag, Calculator, Smartphone, BarChart3, Package, Store, Hexagon } from "lucide-react";

const nodes = [
  {
    id: "online-store",
    label: "Online Store",
    icon: ShoppingBag,

    startX: -60,
    startY: 260,

    finalX: 0,
    finalY: -260,

    colorClass: "text-blue-500",
  },
  {
    id: "pos",
    label: "POS",
    icon: Calculator,

    startX: 380,
    startY: 170,

    finalX: 280,
    finalY: -140,

    colorClass: "text-emerald-500",
  },
  {
    id: "mobile-app",
    label: "Mobile App",
    icon: Smartphone,

    startX: 320,
    startY: -180,

    finalX: 280,
    finalY: 140,

    colorClass: "text-purple-500",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,

    startX: 80,
    startY: -280,

    finalX: 0,
    finalY: 260,

    colorClass: "text-blue-500",
  },
  {
    id: "warehouse",
    label: "Warehouse",
    icon: Package,

    startX: -560,
    startY: -140,

    finalX: -280,
    finalY: 140,

    colorClass: "text-emerald-500",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,

    startX: -460,
    startY: 140,

    finalX: -280,
    finalY: -140,

    colorClass: "text-purple-500",
  },
];

function getPath(x: number, y: number) {
   if (Math.abs(x) < 50) {
      return `M 0 0 L 0 ${y}`;
   }
   return `M 0 0 C ${x/2} 0, ${x/2} ${y}, ${x} ${y}`;
}

function AnimatedNode({ node, progress, index, windowSize, vizScale }: { node: typeof nodes[0], progress: any, index: number, windowSize: { width: number, height: number }, vizScale: number }) {
  const isMobile = windowSize.width < 768;
  const initX = node.startX;
const initY = node.startY;
  const start = 0.45;
const end = 0.72;

const x = useTransform(progress, [start, end], [initX, node.finalX]);
const y = useTransform(progress, [start, end], [initY, node.finalY]);
const scale = useTransform(
  progress,
  [start, end],
  [0.85, 1]
);
  
  return (
    <motion.div
       style={{ x, y, scale }}
       className="absolute top-1/2 left-1/2 w-[140px] -ml-[70px] -mt-[60px] flex flex-col items-center z-20 pointer-events-auto"
    >
       <div className="w-[120px] h-[100px] bg-card/80 border border-border rounded-2xl backdrop-blur-md flex flex-col items-center justify-center mb-3 shadow-xl transition-transform hover:scale-105">
          <node.icon className={`w-8 h-8 mb-2 ${node.colorClass}`} />
          <span className="text-sm font-medium text-foreground text-center leading-tight px-2">{node.label}</span>
       </div>
    </motion.div>
  )
}

function AnimatedLine({ node, progress }: { node: typeof nodes[0], progress: any }) {
  const opacity = useTransform(progress, [0.4, 0.6], [0, 2]);
  return (
    <g>
       <motion.path 
          d={getPath(node.finalX, node.finalY)} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="text-blue-500/20"
          style={{ opacity }}
       />
       <motion.path
          d={getPath(node.finalX, node.finalY)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 12"
          className="text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]"
          animate={{ strokeDashoffset: [0, -16] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ opacity }}
       />
    </g>
  )
}

export function ScrollHero() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  const isMobile = windowSize.width < 768;

  // Text Animation
  const textOpacity = useTransform(
  smoothProgress,
  [0.08, 0.42],
  [1, 0]
);

const textY = useTransform(
  smoothProgress,
  [0.08, 0.42],
  [0, -100]
);

const textScale = useTransform(
  smoothProgress,
  [0.08, 0.42],
  [1, 0.95]
);
  const textPointerEvents = useTransform(smoothProgress, (val) => val > 0.4 ? "none" : "auto");

  // Center Core Animation
  const centerScale = useTransform(
  smoothProgress,
  [0.48, 0.65],
  [0.85, 1]
);

const centerOpacity = useTransform(
  smoothProgress,
  [0.48, 0.65],
  [0, 1]
);

  // Background Rings Animation
  const ringsOpacity = useTransform(smoothProgress, [0.4, 0.7], [0, 1]);

  if (!mounted) return <section ref={targetRef} className="relative h-[300vh] w-full bg-background" />;

  const baseVizWidth = 840; // Approx max width needed
  const baseVizHeight = 720; // Approx max height needed
  
  // Calculate viz scale based on viewport size to prevent cutoffs
  const vizScale = Math.min(
     (windowSize.width - 40) / baseVizWidth,
     (windowSize.height - 40) / baseVizHeight,
     1
  );

  return (
    <section ref={targetRef} className="relative h-[360vh] w-full bg-background ">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden ">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-background pointer-events-none">
          <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px]" />
        </div>

        {/* Text Content */}
        <motion.div 
          style={{ y: textY, opacity: textOpacity, scale: textScale, pointerEvents: textPointerEvents as any }}
          className="absolute z-30 text-center w-full max-w-5xl mx-auto px-4 "
        >
          <h1 className="text-5xl font-bold sm:text-7xl md:text-8xl mb-8 text-foreground leading-[1.1]">
            Your entire <br className="hidden sm:block" />
            Commerce Business, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-accent">
              Synchronized.
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg sm:text-2xl text-foreground/70 mb-8 font-light leading-relaxed">
            Unify inventory, orders, customers, and every sales channel in a single powerful backend. Real-time. Accurate. Effortless.
          </p>
        </motion.div>

        {/* Visualization */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 pt-16">
           <motion.div 
             className="relative"
           >
              {/* Lines SVG */}
              <motion.svg 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] overflow-visible"
              >
                <defs>
                   <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                   </radialGradient>
                </defs>
                <g transform="translate(500, 500)">
                   {/* Concentric rings */}
                   <motion.g style={{ opacity: ringsOpacity }}>
                     <circle cx="0" cy="0" r="180" fill="none" stroke="currentColor" className="text-foreground opacity-5" strokeWidth="1" />
                     <circle cx="0" cy="0" r="300" fill="none" stroke="currentColor" className="text-foreground opacity-5" strokeWidth="1" strokeDasharray="4 4" />
                     <circle cx="0" cy="0" r="420" fill="none" stroke="currentColor" className="text-foreground opacity-5" strokeWidth="1" />
                     {/* Glow behind center */}
                     <circle cx="0" cy="0" r="150" fill="url(#glowGradient)" />
                   </motion.g>

                   {/* Connecting Paths */}
                   {nodes.map(node => (
                     <AnimatedLine key={`line-${node.id}`} node={node} progress={smoothProgress} />
                   ))}
                </g>
              </motion.svg>

              {/* Central Core */}
              <motion.div 
                 style={{ opacity: centerOpacity, scale: centerScale }}
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[240px] rounded-[40px] bg-card/95 border border-border shadow-[0_0_80px_rgba(59,130,246,0.15)] backdrop-blur-xl flex flex-col items-center justify-center z-30"
              >
                 {/* Inner glow outline */}
                 <div className="absolute inset-0 rounded-[40px] border border-blue-500/10" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-[40px]" />
                 <h2 className="text-3xl font-bold text-foreground mb-6 text-center tracking-tight">Commerce<br/>Core</h2>
              </motion.div>

              {/* Outer Nodes */}
              {nodes.map((node, index) => (
                 <AnimatedNode key={`node-${node.id}`} node={node} index={index} progress={smoothProgress} windowSize={windowSize} vizScale={vizScale} />
              ))}

           </motion.div>
        </div>
      </div>
    </section>
  );
}

