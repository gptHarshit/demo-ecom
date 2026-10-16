"use client";

import { motion } from "motion/react";
import { Check, type LucideIcon } from "lucide-react";

interface SelectableCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export default function SelectableCard({
  icon: Icon,
  title,
  description,
  selected,
  onSelect,
}: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.988 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-pressed={selected}
      className={`
        group
        relative
        flex
        w-full
        items-start
        gap-4
        rounded-2xl
        border
        p-5
        text-left
        transition-colors
        ${
          selected
            ? "border-accent bg-accent/5 shadow-md shadow-accent/10 ring-1 ring-accent/30"
            : "border-border bg-card hover:border-accent/40 hover:bg-accent/5"
        }
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          transition-colors
          ${
            selected
              ? "bg-accent text-white"
              : "bg-background text-muted-text group-hover:text-accent"
          }
        `}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-text">
          {description}
        </p>
      </div>

      <div
        className={`
          mt-1
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          border-2
          transition-all
          ${selected ? "border-accent bg-accent" : "border-border"}
        `}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
    </motion.button>
  );
}