"use client";

import { useState } from "react";
import { Loader2, Minus, Plus, X } from "lucide-react";

import { adjustInventory } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";
import type { ProductInventory } from "@/types/product";

interface Props {
  productId: string;
  currentOnHand: number;
  onAdjusted: (inventory: ProductInventory) => void;
  onCancel: () => void;
}

export default function StockAdjuster({
  productId,
  currentOnHand,
  onAdjusted,
  onCancel,
}: Props) {
  const [delta, setDelta] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const deltaNum = Number(delta);
  const isValid = delta !== "" && Number.isInteger(deltaNum) && deltaNum !== 0;
  const wouldGoNegative = isValid && currentOnHand + deltaNum < 0;
  const projected = isValid ? currentOnHand + deltaNum : currentOnHand;

  const applyDelta = (amount: number) => {
    const next = (Number(delta) || 0) + amount;
    setDelta(String(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setIsSubmitting(true);
      const inventory = await adjustInventory(productId, {
        quantity_delta: deltaNum,
      });
      onAdjusted(inventory);
    } catch (error) {
      // Backend errors such as INSUFFICIENT_STOCK (422) surface here.
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Adjust stock
      </h3>

      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm text-muted-text">
          On hand:{" "}
          <span className="font-semibold text-foreground">
            {currentOnHand}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyDelta(-1)}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-text transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>

          <input
            type="number"
            step="1"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="0"
            disabled={isSubmitting}
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => applyDelta(1)}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-text transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {isValid && (
          <span className="text-sm text-muted-text">
            → new on hand:{" "}
            <span
              className={`font-semibold ${wouldGoNegative ? "text-red-400" : "text-foreground"}`}
            >
              {projected}
            </span>
          </span>
        )}
      </div>

      {wouldGoNegative && (
        <p className="mt-2 text-sm text-red-400">
          Stock can&apos;t go below zero.
        </p>
      )}

      {errorMessage && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={!isValid || wouldGoNegative || isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Applying..." : "Apply"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-text transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}