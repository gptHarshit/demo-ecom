"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const InventorySearch: React.FC<
  InventorySearchProps
> = ({
  value,
  onChange,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="relative">
        <Search
          className="
            absolute
            left-4
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-muted-text
          "
        />

        <input
          type="search"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Search by product name or SKU..."
          className="
            h-11
            w-full
            rounded-xl
            border
            border-border
            bg-background
            pl-11
            pr-10
            text-sm
            text-foreground
            placeholder:text-muted-text
            outline-none
            transition-all
            focus:border-[#0284c7]
            focus:ring-2
            focus:ring-[#0284c7]/10
          "
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="
              absolute
              right-3
              top-1/2
              flex
              h-7
              w-7
              -translate-y-1/2
              items-center
              justify-center
              rounded-lg
              text-muted-text
              hover:bg-border/30
              hover:text-foreground
            "
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};