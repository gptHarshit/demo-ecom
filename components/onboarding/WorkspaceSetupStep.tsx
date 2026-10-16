"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Boxes, Rocket } from "lucide-react";

import { useOnboarding } from "@/context/OnboardingContext";
import StepShell from "./StepShell";

interface WorkspaceSetupStepProps {
  onContinue: () => void;
}

export default function WorkspaceSetupStep({
  onContinue,
}: WorkspaceSetupStepProps) {
  const { setFormData, formData } = useOnboarding();

  const [workspaceName, setWorkspaceName] = useState(formData.workspaceName);

  const handleContinue = () => {
    if (!workspaceName.trim()) return;

    setFormData((prev) => ({
      ...prev,
      workspaceName: workspaceName.trim(),
    }));

    onContinue();
  };

  return (
    <StepShell
      icon={Rocket}
      eyebrow="Step 6 of 8"
      title="Name your workspace"
      subtitle="This name will appear across your inventory dashboard."
      onContinue={handleContinue}
      continueDisabled={!workspaceName.trim()}
    >
      <div className="relative">
        <Rocket className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-text" />

        <input
          type="text"
          autoFocus
          placeholder="Enter workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleContinue();
          }}
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-4 text-base text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
      </div>

      {/* Live preview of how this will look once the workspace is live */}
      <motion.div
        initial={false}
        animate={{ opacity: workspaceName.trim() ? 1 : 0.5 }}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Boxes className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {workspaceName.trim() || "Your workspace name"}
          </p>
          <p className="text-xs text-muted-text">
            This is how it will appear in your sidebar
          </p>
        </div>
      </motion.div>
    </StepShell>
  );
}