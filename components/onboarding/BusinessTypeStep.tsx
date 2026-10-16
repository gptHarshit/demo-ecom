"use client";

import { useState } from "react";
import { Boxes, Factory, Store, Truck, Warehouse } from "lucide-react";

import { useOnboarding } from "@/context/OnboardingContext";
import StepShell from "./StepShell";
import SelectableCard from "./SelectableCard";

interface BusinessTypeStepProps {
  onContinue: () => void;
}

const BUSINESS_TYPES = [
  {
    id: "retailer",
    title: "Retailer",
    description:
      "Manage inventory, stock movement, billing, and sales for your retail store.",
    icon: Store,
  },
  {
    id: "wholesaler",
    title: "Wholesaler",
    description:
      "Track bulk inventory, supplier orders, and warehouse stock efficiently.",
    icon: Boxes,
  },
  {
    id: "distributor",
    title: "Distributor",
    description:
      "Manage inventory distribution across multiple retailers and locations.",
    icon: Truck,
  },
  {
    id: "manufacturer",
    title: "Manufacturer",
    description:
      "Monitor raw materials, production inventory, and finished goods.",
    icon: Factory,
  },
  {
    id: "warehouse",
    title: "Warehouse",
    description:
      "Control inbound, outbound, and storage operations from a central warehouse.",
    icon: Warehouse,
  },
];

export default function BusinessTypeStep({
  onContinue,
}: BusinessTypeStepProps) {
  const { setFormData, formData } = useOnboarding();

  const [selectedBusinessType, setSelectedBusinessType] = useState(
    formData.businessType,
  );

  const handleContinue = () => {
    if (!selectedBusinessType) return;

    setFormData((prev) => ({
      ...prev,
      businessType: selectedBusinessType,
    }));

    onContinue();
  };

  return (
    <StepShell
      icon={Store}
      eyebrow="Step 1 of 8"
      title="What type of business do you run?"
      subtitle="Select the option that best describes your business."
      onContinue={handleContinue}
      continueDisabled={!selectedBusinessType}
    >
      {BUSINESS_TYPES.map((business) => (
        <SelectableCard
          key={business.id}
          icon={business.icon}
          title={business.title}
          description={business.description}
          selected={selectedBusinessType === business.id}
          onSelect={() => setSelectedBusinessType(business.id)}
        />
      ))}
    </StepShell>
  );
}