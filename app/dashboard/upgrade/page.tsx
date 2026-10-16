"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  Crown,
  Info,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";

import { useTenant } from "@/context/TenantContext";

type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: "pro" | "premium";
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  monthlyPrice: number;
  /** Per-month price when billed yearly (20% off the monthly price). */
  yearlyMonthlyPrice: number;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

// Demo data only — swap in real plans/prices from your billing provider later.
const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing stores that need more power.",
    icon: Rocket,
    monthlyPrice: 999,
    yearlyMonthlyPrice: 799,
    highlighted: true,
    badge: "Most popular",
    features: [
      "Up to 5,000 products",
      "3 team members",
      "Advanced sales analytics",
      "Up to 3 sales channels",
      "API access",
      "Email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For scaling businesses with no limits.",
    icon: Crown,
    monthlyPrice: 2499,
    yearlyMonthlyPrice: 1999,
    highlighted: false,
    features: [
      "Unlimited products",
      "Unlimited team members",
      "Custom reports & exports",
      "Unlimited sales channels",
      "Multi-warehouse inventory",
      "Priority 24/7 support",
      "Dedicated account manager",
    ],
  },
];

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function UpgradePage() {
  const { workspace } = useTenant();

  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [notice, setNotice] = useState("");

  const currentPlan = workspace?.business.plan?.toLowerCase() ?? "";

  const handleChoosePlan = (plan: Plan) => {
    // No payment provider is wired up yet, so this is a preview only.
    setNotice(
      `You picked ${plan.name} (${billing}). Payments aren't connected yet — this page is a preview of the plans.`,
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Heading */}

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0284c7] to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Choose the plan that fits your store
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-text">
          Upgrade anytime to unlock advanced analytics, more channels and
          priority support.
          {currentPlan && (
            <>
              {" "}
              You&apos;re currently on the{" "}
              <span className="font-semibold capitalize text-foreground">
                {currentPlan}
              </span>{" "}
              plan.
            </>
          )}
        </p>

        {/* Billing toggle */}

        <div className="mt-6 inline-flex items-center rounded-full border border-border bg-card p-1">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBilling(cycle)}
              className={`
                relative
                rounded-full
                px-4
                py-1.5
                text-xs
                font-semibold
                capitalize
                transition-colors
                ${
                  billing === cycle
                    ? "bg-[#0284c7] text-white shadow-sm"
                    : "text-muted-text hover:text-foreground"
                }
              `}
            >
              {cycle}

              {cycle === "yearly" && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                    billing === "yearly"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  Save 20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}

      <div className="grid gap-5 md:grid-cols-2">
        {PLANS.map((plan, index) => {
          const Icon = plan.icon;

          const price =
            billing === "monthly" ? plan.monthlyPrice : plan.yearlyMonthlyPrice;

          const isCurrent = currentPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className={`
                relative
                flex
                flex-col
                rounded-2xl
                border
                bg-card
                p-6
                shadow-sm
                ${
                  plan.highlighted
                    ? "border-[#0284c7] shadow-lg shadow-sky-500/10 ring-1 ring-[#0284c7]/30"
                    : "border-border"
                }
              `}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-[#0284c7] to-indigo-500 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                  <Star className="h-3 w-3 fill-white" />
                  {plan.badge}
                </span>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    plan.highlighted
                      ? "bg-[#0284c7] text-white"
                      : "bg-fuchsia-500/10 text-fuchsia-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {plan.name}
                  </h2>

                  <p className="text-xs text-muted-text">{plan.tagline}</p>
                </div>
              </div>

              <div className="mb-1 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {formatPrice(price)}
                </span>

                <span className="pb-1.5 text-sm text-muted-text">/ month</span>
              </div>

              <p className="mb-5 h-4 text-xs text-muted-text">
                {billing === "yearly"
                  ? `Billed ${formatPrice(plan.yearlyMonthlyPrice * 12)} per year`
                  : "Billed monthly, cancel anytime"}
              </p>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-foreground"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleChoosePlan(plan)}
                disabled={isCurrent}
                className={`
                  w-full
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#0284c7] to-indigo-500 text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98]"
                      : "border border-border bg-background text-foreground hover:bg-border/30 active:scale-[0.98]"
                  }
                `}
              >
                {isCurrent ? "Current plan" : `Choose ${plan.name}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Preview notice */}

      {notice && (
        <div
          role="status"
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#0284c7]/20 bg-[#0284c7]/5 px-4 py-3 text-sm text-foreground"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0284c7]" />

          {notice}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-text">
        Prices and features shown are demo data for now.
      </p>
    </div>
  );
}