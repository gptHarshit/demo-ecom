"use client";

import { Navbar } from "@/components/landing/Navbar";
import { ScrollHero } from "@/components/landing/ScrollHero";
import FlowSection from "@/components/landing/FlowSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import BusinessSection from "@/components/landing/BusinessSection";
import DemoScreenShortDisplay from "@/components/views/DemoScreenShortDisplay";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <ScrollHero />
        <FlowSection />
        <DemoScreenShortDisplay />
        <BusinessSection />
        <TestimonialSection />
      </main>
    </>
  );
}
