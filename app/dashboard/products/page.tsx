"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Eye,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings2,
} from "lucide-react";

import ProductForm from "@/components/products/ProductForm";
import ProductEditForm from "@/components/products/ProductEditForm";
import VariantsPanel from "@/components/products/VariantsPanel";
import { archiveProduct, getProducts } from "@/lib/api/product.api";
import { listOptionTypes } from "@/lib/api/product-options.api";
import { ApiError } from "@/lib/api/api-error";
import type {
  OptionTypeResponse,
  ProductResponse,
  ProductStatus,
} from "@/types/product";

const PAGE_SIZE = 20;

const statusStyles: Record<ProductStatus, string> = {
  draft: "bg-slate-500/10 text-slate-400",
  active: "bg-emerald-500/10 text-emerald-400",
  archived: "bg-amber-500/10 text-amber-400",
};

type Panel = { id: string; mode: "edit" | "variants" } | null;

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [search, setSearch] = useState("");

  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Loaded once and passed down to every VariantsPanel/VariantForm, so each
  // row doesn't refetch the same business-wide option list.
  const [optionTypes, setOptionTypes] = useState<OptionTypeResponse[]>([]);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await getProducts({ limit: PAGE_SIZE, offset });
      setProducts(res.products ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Failed to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [offset, router]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    // Non-blocking: if this fails, the variants forms just show "no option
    // types yet" instead of breaking the products page.
    listOptionTypes()
      .then(setOptionTypes)
      .catch(() => setOptionTypes([]));
  }, []);

  const handleArchive = async (p: ProductResponse) => {
    if (!window.confirm(`Archive "${p.name}"?`)) return;

    try {
      setArchivingId(p.id);
      setActionError("");

      await archiveProduct(p.id);

      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, status: "archived" as ProductStatus } : x,
        ),
      );

      if (panel?.id === p.id) setPanel(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setActionError(
        err instanceof ApiError ? err.message : "Failed to archive product.",
      );
    } finally {
      setArchivingId(null);
    }
  };

  // Client-side filter over the currently loaded page — the backend doesn't
  // expose a search query param, so this only narrows what's already fetched.
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, search]);

  // No `total` from the API, so a full page implies there may be more.
  const hasNext = products.length === PAGE_SIZE;
  const hasPrev = offset > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <Link
            href="/dashboard/options"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-text transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Manage options
            {/* <span className="text-xs text-muted-text/70">
              (Size, Color, ...)
            </span> */}
          </Link>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Close" : "Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ProductForm
            onCancel={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              // Refetch so ordering and pagination stay consistent with the server
              if (offset === 0) loadProducts();
              else setOffset(0);
            }}
          />
        </div>
      )}

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search this page by name or SKU..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-text">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading products...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-1 text-sm text-red-400 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && visibleProducts.length === 0 && (
        <p className="text-muted-text">
          {search
            ? "No products on this page match your search."
            : hasPrev
              ? "No more products."
              : "No products yet. Add your first one."}
        </p>
      )}

      {actionError && (
        <p className="mb-3 text-sm text-red-400">{actionError}</p>
      )}

      {visibleProducts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-text">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">On hand</th>
                <th className="px-4 py-3 font-medium">Available</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {visibleProducts.map((p) => (
                <Fragment key={p.id}>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link
                        href={`/dashboard/products/${p.id}`}
                        className="hover:text-accent hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-text">{p.sku}</td>
                    <td className="px-4 py-3 text-foreground">₹{p.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {p.inventory.quantity_on_hand}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {p.inventory.quantity_available}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/products/${p.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-text hover:bg-background hover:text-accent"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-text hover:bg-background hover:text-accent"
                          onClick={() => setPanel({ id: p.id, mode: "edit" })}
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-text hover:bg-background hover:text-accent"
                          onClick={() =>
                            setPanel({ id: p.id, mode: "variants" })
                          }
                          title="Manage variants"
                        >
                          <Layers className="h-4 w-4" />
                        </button>

                        {p.status !== "archived" && (
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-text hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                            disabled={archivingId === p.id}
                            onClick={() => handleArchive(p)}
                            title="Archive product"
                          >
                            {archivingId === p.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {panel?.id === p.id && (
                    <tr className="border-t border-border bg-background/40">
                      <td colSpan={7} className="px-4 py-4">
                        {panel.mode === "edit" && (
                          <ProductEditForm
                            product={p}
                            onCancel={() => setPanel(null)}
                            onSaved={(updated) => {
                              setProducts((prev) =>
                                prev.map((x) =>
                                  x.id === updated.id
                                    ? { ...x, ...updated }
                                    : x,
                                ),
                              );
                              setPanel(null);
                            }}
                          />
                        )}

                        {panel.mode === "variants" && (
                          <div className="rounded-xl border border-border bg-card p-5">
                            <VariantsPanel
                              productId={p.id}
                              optionTypes={optionTypes}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(hasPrev || hasNext) && (
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={!hasPrev || isLoading}
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-all hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-muted-text">
            Showing {offset + 1}-{offset + products.length}
          </span>

          <button
            disabled={!hasNext || isLoading}
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-all hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}