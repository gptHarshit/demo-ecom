"use client";

import { motion } from "motion/react";
import { ArrowRight, Loader2, type LucideIcon } from "lucide-react";

interface StepShellProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  isSubmitting?: boolean;
}

export default function StepShell({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
  onContinue,
  continueDisabled = false,
  continueLabel = "Continue",
  isSubmitting = false,
}: StepShellProps) {
  const disabled = continueDisabled || isSubmitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14"
    >
      <div className="mb-9 flex flex-col items-start gap-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.4, ease: "backOut", delay: 0.05 }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-indigo-500 text-white shadow-lg shadow-accent/25"
        >
          <Icon className="h-6 w-6" />
        </motion.div>

        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        <p className="text-base leading-relaxed text-muted-text">
          {subtitle}
        </p>
      </div>

      <div className="space-y-3">{children}</div>

      <button
        type="button"
        onClick={onContinue}
        disabled={disabled}
        className={`
          group
          mt-8
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          py-3.5
          text-sm
          font-semibold
          transition-all
          ${
            disabled
              ? "cursor-not-allowed bg-border text-muted-text"
              : "bg-gradient-to-r from-accent to-indigo-500 text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.99]"
          }
        `}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {continueLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </motion.div>
  );
}