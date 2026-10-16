"use client";

import { useState } from "react";
import { Boxes, Infinity as InfinityIcon, Package, PackagePlus } from "lucide-react";

import { useOnboarding } from "@/context/OnboardingContext";
import StepShell from "./StepShell";
import SelectableCard from "./SelectableCard";

interface ProductCountStepProps {
  onContinue: () => void;
}

const PRODUCT_COUNTS = [
  {
    id: "1-100",
    title: "1 - 100 Products",
    description: "Perfect for small businesses getting started.",
    icon: Package,
  },
  {
    id: "101-500",
    title: "101 - 500 Products",
    description: "Suitable for growing businesses.",
    icon: PackagePlus,
  },
  {
    id: "501-1000",
    title: "501 - 1000 Products",
    description: "Manage a large inventory efficiently.",
    icon: Boxes,
  },
  {
    id: "1000+",
    title: "1000+ Products",
    description: "Built for enterprises with extensive inventory.",
    icon: InfinityIcon,
  },
];

export default function ProductCountStep({
  onContinue,
}: ProductCountStepProps) {
  const { setFormData, formData } = useOnboarding();

  const [selectedProductCount, setSelectedProductCount] = useState(
    formData.productCount,
  );

  const handleContinue = () => {
    if (!selectedProductCount) return;

    setFormData((prev) => ({
      ...prev,
      productCount: selectedProductCount,
    }));

    onContinue();
  };

  return (
    <StepShell
      icon={Boxes}
      eyebrow="Step 5 of 8"
      title="How many products do you manage?"
      subtitle="This helps us optimize your inventory experience."
      onContinue={handleContinue}
      continueDisabled={!selectedProductCount}
    >
      {PRODUCT_COUNTS.map((product) => (
        <SelectableCard
          key={product.id}
          icon={product.icon}
          title={product.title}
          description={product.description}
          selected={selectedProductCount === product.id}
          onSelect={() => setSelectedProductCount(product.id)}
        />
      ))}
    </StepShell>
  );
}