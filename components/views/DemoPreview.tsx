"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { DemoScreen } from "@/types/demo";

interface DemoPreviewProps {
  screen: DemoScreen;
}

const DemoPreview: React.FC<DemoPreviewProps> = ({ screen }) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const currentImage = isDark ? screen.images.dark : screen.images.light;

  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${screen.id}-${resolvedTheme}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              duration: 0.35,
              ease: "easeInOut",
            }}
            className="relative aspect-[16/9] w-full"
          >
            <Image
              src={currentImage}
              alt={screen.label}
              fill
              priority
              className="object-contain"
              // className="object-cover"
              sizes="(max-width:768px) 100vw, (max-width:1200px) 90vw, 1200px"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DemoPreview;
