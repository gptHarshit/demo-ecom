"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Box,
  CheckCircle2,
  Edit3,
  Loader2,
  Package,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import {
  archiveProduct,
  getProduct,
  getProductInventory,
} from "@/lib/api/product.api";

import { ApiError } from "@/lib/api/api-error";

import type {
  ProductInventory,
  ProductResponse,
} from "@/types/product";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();

  const productId = params.id as string;

  const [product, setProduct] =
    useState<ProductResponse | null>(null);

  const [inventory, setInventory] =
    useState<ProductInventory | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [isArchiving, setIsArchiving] =
    useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [productResponse, inventoryResponse] =
        await Promise.all([
          getProduct(productId),
          getProductInventory(productId),
        ]);

      setProduct(productResponse);
      setInventory(inventoryResponse);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 401
      ) {
        router.push("/login");
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load product.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId, loadProduct]);

  const handleArchive = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Archive "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      setIsArchiving(true);
      setError("");

      await archiveProduct(product.id);

      setProduct((current) =>
        current
          ? {
              ...current,
              status: "archived",
            }
          : current,
      );
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 401
      ) {
        router.push("/login");
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to archive product.",
      );
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-card">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#0284c7]" />

            <p className="text-sm font-semibold text-foreground">
              Loading product...
            </p>

            <p className="mt-1 text-xs text-muted-text">
              Fetching product and inventory details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8">
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/products")
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-text transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </button>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <RefreshCw className="h-5 w-5" />
            </div>

            <h2 className="text-sm font-semibold text-foreground">
              Unable to load product
            </h2>

            <p className="mt-1 max-w-md text-xs text-muted-text">
              {error || "Product not found."}
            </p>

            <button
              type="button"
              onClick={loadProduct}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onHand =
    inventory?.quantity_on_hand ?? 0;

  const reserved =
    inventory?.quantity_reserved ?? 0;

  const available =
    inventory?.quantity_available ??
    Math.max(0, onHand - reserved);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8">
      {/* Back */}
      <button
        type="button"
        onClick={() =>
          router.push("/dashboard/products")
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      {/* Header */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0284c7]/10 text-[#0284c7]">
            <Package className="h-7 w-7" />
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>

              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold capitalize text-muted-text">
                {product.status}
              </span>
            </div>

            <p className="font-mono text-xs text-muted-text">
              SKU: {product.sku}
            </p>

            {product.description && (
              <p className="mt-2 max-w-2xl text-sm text-muted-text">
                {product.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/products?edit=${product.id}`,
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>

          {product.status !== "archived" && (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArchiving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}

              Archive
            </button>
          )}
        </div>
      </div>

      {/* Product information */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
              <Box className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Product information
              </h2>

              <p className="text-xs text-muted-text">
                Basic catalog information.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="Product name"
              value={product.name}
            />

            <InfoItem
              label="SKU"
              value={product.sku}
              mono
            />

            <InfoItem
              label="Price"
              value={`₹${product.price}`}
            />

            <InfoItem
              label="Status"
              value={product.status}
              capitalize
            />

            <InfoItem
              label="Created"
              value={formatDate(product.created_at)}
            />

            <InfoItem
              label="Last updated"
              value={formatDate(product.updated_at)}
            />
          </div>
        </div>

        {/* Price */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-text">
            Current price
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            ₹{product.price}
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-text">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Catalog price
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
            <Warehouse className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Inventory
            </h2>

            <p className="text-xs text-muted-text">
              Current inventory position.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <InventoryCard
            label="On hand"
            value={onHand}
          />

          <InventoryCard
            label="Reserved"
            value={reserved}
          />

          <InventoryCard
            label="Available"
            value={available}
            highlighted
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-text">
        {label}
      </p>

      <p
        className={[
          "mt-1.5 text-sm font-semibold text-foreground",
          mono ? "font-mono" : "",
          capitalize ? "capitalize" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function InventoryCard({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: number;
  highlighted?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border px-4 py-4",
        highlighted
          ? "border-[#0284c7]/20 bg-[#0284c7]/5"
          : "border-border bg-background",
      ].join(" ")}
    >
      <p className="text-xs font-medium text-muted-text">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}