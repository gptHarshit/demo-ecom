"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Boxes } from "lucide-react";

import BusinessTypeStep from "./BusinessTypeStep";
import BusinessNameStep from "./BusinessNameStep";
import SellingChannelStep from "./SellingChannelStep";
import SolutionStep from "./SolutionStep";
import ProductCountStep from "./ProductCountStep";
import WorkspaceSetupStep from "./WorkspaceSetupStep";
import WorkspaceReadyStep from "./WorkspaceReadyStep";
import SignupStep from "./SignupStep";

const TOTAL_STEPS = 8;

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BusinessTypeStep key="business-type" onContinue={nextStep} />;

      case 1:
        return <BusinessNameStep key="business-name" onContinue={nextStep} />;

      case 2:
        return (
          <SellingChannelStep key="selling-channel" onContinue={nextStep} />
        );

      case 3:
        return <SolutionStep key="solution" onContinue={nextStep} />;

      case 4:
        return <ProductCountStep key="product-count" onContinue={nextStep} />;

      case 5:
        return (
          <WorkspaceSetupStep key="workspace-setup" onContinue={nextStep} />
        );

      case 6:
        return (
          <WorkspaceReadyStep key="workspace-ready" onContinue={nextStep} />
        );

      case 7:
        return <SignupStep key="signup" />;

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Decorative background glow — purely visual, sits behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[-10%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <header className="relative z-10 px-6 py-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              Commerce Core
            </span>
          </div>

          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-text transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="mx-auto mt-5 max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-text">
            <span>
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-indigo-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <section className="relative z-10">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </section>
    </main>
  );
}