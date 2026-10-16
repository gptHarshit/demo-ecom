"use client";

import { useCallback, useEffect, useState } from "react";

import { getProducts } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";
import type { ProductResponse } from "@/types/product";

// Products at or below this on-hand quantity count as "low stock".
export const LOW_STOCK_THRESHOLD = 5;

// How many products to scan for low stock. Keeps this feature simple (one
// request, first page) rather than paging through the whole catalog.
const SCAN_LIMIT = 100;

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
}

export function useLowStockProducts() {
  const [lowStockProducts, setLowStockProducts] = useState<
    LowStockProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await getProducts({ limit: SCAN_LIMIT, offset: 0 });

      const low = (res.products ?? [])
        .filter(
          (p: ProductResponse) =>
            p.status !== "archived" &&
            p.inventory.quantity_on_hand <= LOW_STOCK_THRESHOLD,
        )
        .map((p: ProductResponse) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantityOnHand: p.inventory.quantity_on_hand,
        }))
        // Lowest stock first, so the most urgent items are on top.
        .sort((a, b) => a.quantityOnHand - b.quantityOnHand);

      setLowStockProducts(low);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to check stock levels.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { lowStockProducts, isLoading, error, reload: load };
}