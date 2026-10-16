"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { useOnboarding } from "@/context/OnboardingContext";
import StepShell from "./StepShell";

interface BusinessNameStepProps {
  onContinue: () => void;
}

export default function BusinessNameStep({
  onContinue,
}: BusinessNameStepProps) {
  const { formData, setFormData } = useOnboarding();

  const [businessName, setBusinessName] = useState(formData.businessName);

  const handleContinue = () => {
    if (!businessName.trim()) return;

    setFormData((prev) => ({
      ...prev,
      businessName: businessName.trim(),
    }));

    onContinue();
  };

  return (
    <StepShell
      icon={Building2}
      eyebrow="Step 2 of 8"
      title="What's your business name?"
      subtitle="This helps us personalize your workspace."
      onContinue={handleContinue}
      continueDisabled={!businessName.trim()}
    >
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-text" />

        <input
          type="text"
          autoFocus
          placeholder="Enter your business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleContinue();
          }}
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-4 text-base text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
      </div>
    </StepShell>
  );
}