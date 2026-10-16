"use client";

import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";

import OptionTypesManager from "@/components/options/OptionTypesManager";

export default function ProductOptionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to products
      </Link>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Product Options
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-text">
            Define reusable options like Size or Color once, then pick from
            them whenever you add a variant to any product.
          </p>
        </div>
      </div>

      <OptionTypesManager />
    </div>
  );
}