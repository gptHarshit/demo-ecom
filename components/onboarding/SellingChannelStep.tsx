"use client";

import { useState } from "react";
import { Globe, Handshake, LayoutGrid, ShoppingBag, Store } from "lucide-react";

import { useOnboarding } from "@/context/OnboardingContext";
import StepShell from "./StepShell";
import SelectableCard from "./SelectableCard";

interface SellingChannelStepProps {
  onContinue: () => void;
}

const SELLING_CHANNELS = [
  {
    id: "retail-store",
    title: "Retail Store",
    description: "Sell products directly to customers through your physical store.",
    icon: Store,
  },
  {
    id: "online-store",
    title: "Online Store",
    description: "Manage inventory for your e-commerce website.",
    icon: Globe,
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Sell through platforms like Amazon, Flipkart, or Meesho.",
    icon: ShoppingBag,
  },
  {
    id: "wholesale",
    title: "Wholesale",
    description: "Manage bulk sales and business customers efficiently.",
    icon: Handshake,
  },
  {
    id: "multi-channel",
    title: "Multiple Channels",
    description:
      "Manage inventory across both offline and online sales channels.",
    icon: LayoutGrid,
  },
];

export default function SellingChannelStep({
  onContinue,
}: SellingChannelStepProps) {
  const { setFormData, formData } = useOnboarding();

  const [selectedChannel, setSelectedChannel] = useState(
    formData.sellingChannel,
  );

  const handleContinue = () => {
    if (!selectedChannel) return;

    setFormData((prev) => ({
      ...prev,
      sellingChannel: selectedChannel,
    }));

    onContinue();
  };

  return (
    <StepShell
      icon={Globe}
      eyebrow="Step 3 of 8"
      title="Where do you sell your products?"
      subtitle="Select your primary selling channel."
      onContinue={handleContinue}
      continueDisabled={!selectedChannel}
    >
      {SELLING_CHANNELS.map((channel) => (
        <SelectableCard
          key={channel.id}
          icon={channel.icon}
          title={channel.title}
          description={channel.description}
          selected={selectedChannel === channel.id}
          onSelect={() => setSelectedChannel(channel.id)}
        />
      ))}
    </StepShell>
  );
}