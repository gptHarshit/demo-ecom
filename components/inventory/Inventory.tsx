"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { ProductResponse } from "@/types/product";

import { getProducts, adjustInventory } from "@/lib/api/product.api";
import { AnalyticsModal } from "./AnalyticsModal";
import { InventoryHeader } from "./InventoryHeader";
import { InventorySearch } from "./InventorySearch";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTable } from "./InventoryTable";
import { ProductFormModal } from "./ProductFormModal";

import type { InventoryFilters as InventoryFiltersType } from "@/types/inventory";

const DEFAULT_FILTERS: InventoryFiltersType = {
  stockStatus: "all",
  quantity: "all",
};

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<InventoryFiltersType>(DEFAULT_FILTERS);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getProducts();

      setProducts(response.products);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load products.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdjustInventory = async (
    product: ProductResponse,
    quantityDelta: number,
  ) => {
    try {
      setError(null);

      await adjustInventory(product.id, {
        quantity_delta: quantityDelta,
      });

      await fetchProducts();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to adjust inventory.");
      }

      throw error;
    }
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch);

      const quantity = product.inventory.quantity_on_hand;

      let matchesStockStatus = true;

      if (filters.stockStatus === "in-stock") {
        matchesStockStatus = quantity > 10;
      }

      if (filters.stockStatus === "low-stock") {
        matchesStockStatus = quantity > 0 && quantity <= 10;
      }

      if (filters.stockStatus === "out-of-stock") {
        matchesStockStatus = quantity === 0;
      }

      let matchesQuantity = true;

      if (filters.quantity === "out-of-stock") {
        matchesQuantity = quantity === 0;
      }

      if (filters.quantity === "low-stock") {
        matchesQuantity = quantity > 0 && quantity <= 10;
      }

      if (filters.quantity === "in-stock") {
        matchesQuantity = quantity > 10;
      }

      return matchesSearch && matchesStockStatus && matchesQuantity;
    });
  }, [products, search, filters]);

  const handleResetFilters = () => {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
  };

  const handleAddProduct = () => {
    setIsProductModalOpen(true);
  };

  const handleProductCreated = async () => {
    await fetchProducts();
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  return (
    <div className="space-y-6">
      <InventoryHeader
        onAddProduct={handleAddProduct}
        onShowAnalytics={handleShowAnalytics}
      />

      <InventorySearch value={search} onChange={setSearch} />

      <InventoryFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-text">
          Loading products...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <InventoryTable
          products={filteredProducts}
          onAdjust={handleAdjustInventory}
        />
      )}

      <ProductFormModal
        open={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
        }}
        onCreated={handleProductCreated}
      />

      <AnalyticsModal
        open={showAnalytics}
        products={products}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  );
};
