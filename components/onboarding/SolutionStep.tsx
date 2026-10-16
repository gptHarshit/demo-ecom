"use client";

import { useState } from "react";
import { Boxes, Receipt, ShoppingCart, Sparkles, Warehouse } from "lucide-react";

import { useOnboarding } from "@/context/OnboardingContext";
import StepShell from "./StepShell";
import SelectableCard from "./SelectableCard";

interface SolutionStepProps {
  onContinue: () => void;
}

const SOLUTIONS = [
  {
    id: "inventory-management",
    title: "Inventory Management",
    description: "Track stock levels, inventory movement, and product availability.",
    icon: Boxes,
  },
  {
    id: "billing-pos",
    title: "Billing & POS",
    description: "Generate invoices and manage point-of-sale operations.",
    icon: Receipt,
  },
  {
    id: "purchase-management",
    title: "Purchase Management",
    description: "Manage suppliers, purchase orders, and incoming inventory.",
    icon: ShoppingCart,
  },
  {
    id: "warehouse-management",
    title: "Warehouse Management",
    description: "Control warehouse operations and stock transfers efficiently.",
    icon: Warehouse,
  },
  {
    id: "complete-business-management",
    title: "Complete Business Management",
    description:
      "Manage inventory, billing, purchases, warehouse, and reports in one place.",
    icon: Sparkles,
  },
];

export default function SolutionStep({ onContinue }: SolutionStepProps) {
  const { setFormData, formData } = useOnboarding();

  const [selectedSolution, setSelectedSolution] = useState(formData.solution);

  const handleContinue = () => {
    if (!selectedSolution) return;

    setFormData((prev) => ({
      ...prev,
      solution: selectedSolution,
    }));

    onContinue();
  };

  return (
    <StepShell
      icon={Sparkles}
      eyebrow="Step 4 of 8"
      title="What are you looking to manage?"
      subtitle="Choose the solution that best matches your needs."
      onContinue={handleContinue}
      continueDisabled={!selectedSolution}
    >
      {SOLUTIONS.map((solution) => (
        <SelectableCard
          key={solution.id}
          icon={solution.icon}
          title={solution.title}
          description={solution.description}
          selected={selectedSolution === solution.id}
          onSelect={() => setSelectedSolution(solution.id)}
        />
      ))}
    </StepShell>
  );
}