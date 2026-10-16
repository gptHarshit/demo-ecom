"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Tenant, Order, LowStockProduct } from "@/types/dashboard";

import {
  MOCK_RECENT_ORDERS,
  MOCK_LOW_STOCK_PRODUCTS,
} from "@/data/mockData";

import { getWorkspace, WorkspaceResponse } from "@/lib/api/workspace.api";
import { ApiError } from "@/lib/api/api-error";

/* ============================================================
   CONTEXT TYPE
============================================================ */

interface TenantContextType {
  /* Current workspace/business */
  activeTenant: Tenant | null;

  /* Workspace data */
  workspace: WorkspaceResponse | null;

  /* Kept for existing UI compatibility */
  tenants: Tenant[];

  setActiveTenant: (tenant: Tenant) => void;

  /* Navigation */
  activeNav: string;
  setActiveNav: (nav: string) => void;

  /* Existing dashboard mock data */
  orders: Order[];

  updateOrderStatus: (
    orderId: string,
    status: Order["fulfillmentStatus"],
  ) => void;

  lowStockProducts: LowStockProduct[];

  adjustStock: (productId: string, amount: number) => void;

  /* Search */
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  /* Workspace loading state */
  isWorkspaceLoading: boolean;

  /* Workspace error */
  workspaceError: string | null;

  /* Manually reload workspace */
  reloadWorkspace: () => Promise<void>;
}

/* ============================================================
   CONTEXT
============================================================ */

const TenantContext = createContext<TenantContextType | undefined>(undefined);

/* ============================================================
   PROVIDER
============================================================ */

export const TenantProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  /* ----------------------------------------------------------
     WORKSPACE
  ---------------------------------------------------------- */

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [isWorkspaceLoading, setIsWorkspaceLoading] =
    useState<boolean>(true);

  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  const [activeNav, setActiveNav] = useState<string>("Dashboard");

  /* ----------------------------------------------------------
     DASHBOARD MOCK DATA

     These are still mock because backend doesn't currently
     provide dashboard/order/low-stock APIs in the contract.
  ---------------------------------------------------------- */

  const [orders, setOrders] = useState<Order[]>(MOCK_RECENT_ORDERS);

  const [lowStockProducts, setLowStockProducts] = useState<
    LowStockProduct[]
  >(MOCK_LOW_STOCK_PRODUCTS);

  /* ----------------------------------------------------------
     SEARCH
  ---------------------------------------------------------- */

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  /* ==========================================================
     LOAD WORKSPACE
  ========================================================== */

  const loadWorkspace = async () => {
    try {
      setIsWorkspaceLoading(true);
      setWorkspaceError(null);

      // Direct call to the Go backend; apiClient attaches the bearer token
      // and silently refreshes it once on a 401 before this throws.
      const data = await getWorkspace();

      /* ------------------------------------------------------
         BASIC RESPONSE VALIDATION
      ------------------------------------------------------ */

      if (!data.business || !data.business.id || !data.business.name) {
        throw new Error("Invalid workspace response.");
      }

      /* ------------------------------------------------------
         STORE COMPLETE WORKSPACE
      ------------------------------------------------------ */

      setWorkspace(data);

      /* ------------------------------------------------------
         CURRENT BUSINESS = ACTIVE TENANT

         There is currently no multi-business switching endpoint
         in the backend contract, so the current workspace
         business is the only valid tenant.
      ------------------------------------------------------ */

      const tenant: Tenant = {
        id: data.business.id,
        name: data.business.name,
        plan: data.business.plan,
        currency: "₹",
      };

      setActiveTenantState(tenant);

      /*
       * Keep a one-item array only because the existing Sidebar
       * expects `tenants`.
       */
      setTenants([tenant]);
    } catch (error) {
      console.error("Failed to load workspace:", error);

      if (error instanceof ApiError) {
        if (error.status === 401) {
          setWorkspaceError("Your session has expired. Please login again.");
        } else if (error.status === 403) {
          setWorkspaceError("Business workspace is required.");
        } else {
          setWorkspaceError(error.message);
        }
      } else if (error instanceof Error) {
        setWorkspaceError(error.message);
      } else {
        setWorkspaceError("Failed to load workspace.");
      }

      setWorkspace(null);
      setActiveTenantState(null);
      setTenants([]);
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  /* ==========================================================
     INITIAL WORKSPACE LOAD
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const initializeWorkspace = async () => {
      if (cancelled) return;
      await loadWorkspace();
    };

    initializeWorkspace();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     ACTIVE TENANT

     Kept because Sidebar currently expects this. In the current
     backend architecture there is only one workspace/business,
     so changing tenant does not call an API.
  ========================================================== */

  const setActiveTenant = (tenant: Tenant) => {
    if (activeTenant && tenant.id !== activeTenant.id) {
      console.warn(
        "Tenant switching is not supported by the current workspace API.",
      );
      return;
    }

    setActiveTenantState(tenant);
  };

  /* ==========================================================
     ORDER STATUS — still local/mock for now.
  ========================================================== */

  const updateOrderStatus = (
    orderId: string,
    status: Order["fulfillmentStatus"],
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, fulfillmentStatus: status } : order,
      ),
    );
  };

  /* ==========================================================
     STOCK ADJUSTMENT — still local/mock for now. Product
     inventory uses the real Commerce Core inventory API
     (see lib/api/product.api.ts) instead of this.
  ========================================================== */

  const adjustStock = (productId: string, newAmount: number) => {
    setLowStockProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, stockLeft: Math.max(0, newAmount) }
          : product,
      ),
    );
  };

  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  return (
    <TenantContext.Provider
      value={{
        activeTenant,
        workspace,
        tenants,
        setActiveTenant,
        activeNav,
        setActiveNav,
        orders,
        updateOrderStatus,
        lowStockProducts,
        adjustStock,
        isSearchOpen,
        setIsSearchOpen,
        isWorkspaceLoading,
        workspaceError,
        reloadWorkspace: loadWorkspace,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

/* ============================================================
   HOOK
============================================================ */

export const useTenant = () => {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }

  return context;
};