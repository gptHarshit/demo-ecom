"use client";

import React, { useMemo, useState } from "react";

import DemoTabs from "./DemoTabs";
import DemoPreview from "./DemoPreview";
import { demoScreens } from "@/data/demoScreens";

const DemoScreenShortDisplay = () => {
  const [activeTab, setActiveTab] = useState(demoScreens[0].id);

  const activeScreen = useMemo(() => {
    return (
      demoScreens.find((screen) => screen.id === activeTab) ??
      demoScreens[0]
    );
  }, [activeTab]);

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {/* <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1 text-sm font-medium text-[var(--accent)]">
            Product Demo
          </span> */}

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Explore Every Module Before You Buy
          </h2>

          {/* <p className="mt-4 text-base leading-7 text-[var(--muted-text)]">
            Click on any module below to preview how the system looks.
            Experience the interface before getting started.
          </p> */}
        </div>

        {/* Tabs */}
        <DemoTabs
          tabs={demoScreens}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Preview */}
        <DemoPreview screen={activeScreen} />
      </div>
    </section>
  );
};

export default DemoScreenShortDisplay;