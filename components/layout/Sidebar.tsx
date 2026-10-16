"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Boxes,
  Store,
  ChevronDown,
  LayoutGrid,
  Package,
  ShoppingBag,
  Users,
  UserCheck,
  Grid2X2,
  Key,
  Check,
  Building2,
  Sparkles,
  Zap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { useTenant } from "@/context/TenantContext";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { id: "Products", label: "Products", icon: Package, href: "/dashboard/products" },
  { id: "Inventory", label: "Inventory", icon: Boxes, href: "/dashboard/inventory" },
  { id: "Orders", label: "Orders", icon: ShoppingBag, href: "/dashboard/orders" },
  { id: "Customers", label: "Customers", icon: Users, href: "/dashboard/customers" },
];

const OPERATIONS_ITEMS: NavItem[] = [
  { id: "Staff", label: "Staff", icon: UserCheck, href: "/dashboard/staff" },
  { id: "Channels", label: "Channels", icon: Grid2X2, href: "/dashboard/channels" },
];

const DEVELOPER_ITEMS: NavItem[] = [
  { id: "API Keys", label: "API Keys", icon: Key, href: "/dashboard/api-keys" },
];

export const Sidebar: React.FC = () => {
  const { activeTenant, setActiveTenant, tenants } = useTenant();

  const pathname = usePathname();

  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);

  // "/dashboard" only matches exactly; every other item also stays highlighted
  // on its nested pages (e.g. /dashboard/products/[id]).
  const isItemActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.href);

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          w-full
          flex
          items-center
          gap-3
          px-3.5
          py-2.5
          rounded-xl
          text-sm
          font-medium
          transition-all
          ${
            isActive
              ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/20"
              : "text-muted-text hover:text-foreground hover:bg-border/30"
          }
        `}
      >
        <Icon
          className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-text"}`}
        />

        <span>{item.label}</span>
      </Link>
    );
  };

  const renderSectionLabel = (label: string) => (
    <div className="px-3.5 text-[11px] font-semibold tracking-wider text-muted-text uppercase mb-2">
      {label}
    </div>
  );

  return (
    <aside
      className="
        sticky
        top-0
        h-screen
        w-64
        shrink-0
        flex
        flex-col
        bg-background
        border-r
        border-border
        transition-colors
        duration-200
        select-none
      "
    >
      {/* BRAND HEADER */}

      <div className="p-5 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
          <Boxes className="w-5 h-5 stroke-[2.2]" />
        </div>

        <span className="font-bold text-lg tracking-tight text-foreground">
          Commerce Core
        </span>
      </div>

      {/* TENANT SWITCHER */}

      <div className="px-4 mb-5 relative shrink-0">
        <button
          type="button"
          onClick={() => {
            if (!activeTenant) return;

            setIsTenantDropdownOpen((previous) => !previous);
          }}
          disabled={!activeTenant}
          className="
            w-full
            flex
            items-center
            justify-between
            px-3
            py-2.5
            rounded-xl
            border
            border-border
            bg-card
            hover:bg-border/30
            transition-all
            text-sm
            text-foreground
            shadow-xs
            disabled:cursor-default
          "
        >
          <div className="flex items-center gap-2.5 truncate">
            <Store className="w-4 h-4 text-muted-text shrink-0" />

            <span className="font-medium truncate">
              {activeTenant?.name ?? "Loading..."}
            </span>
          </div>

          <ChevronDown
            className={`
              w-4
              h-4
              text-muted-text
              transition-transform
              duration-200
              shrink-0
              ${isTenantDropdownOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        <AnimatePresence>
          {isTenantDropdownOpen && activeTenant && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="
                absolute
                left-4
                right-4
                top-13
                z-50
                rounded-xl
                border
                border-border
                bg-card
                shadow-xl
                p-1.5
                space-y-1
              "
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-text uppercase tracking-wider">
                Select Tenant Store
              </div>

              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => {
                    setActiveTenant(tenant);
                    setIsTenantDropdownOpen(false);
                  }}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    px-2.5
                    py-2
                    rounded-lg
                    text-sm
                    text-left
                    transition-colors
                    ${
                      activeTenant.id === tenant.id
                        ? "bg-[#0284c7]/10 text-[#0284c7] font-medium"
                        : "text-foreground hover:bg-border/40"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-text" />

                    <span>{tenant.name}</span>
                  </div>

                  {activeTenant.id === tenant.id && (
                    <Check className="w-4 h-4 text-[#0284c7]" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION AREA */}

      <div className="flex-1 px-3 space-y-6 overflow-y-auto min-h-0">
        <div className="space-y-1">{NAV_ITEMS.map(renderNavLink)}</div>

        <div className="space-y-1">
          {renderSectionLabel("Operations")}
          {OPERATIONS_ITEMS.map(renderNavLink)}
        </div>

        <div className="space-y-1">
          {renderSectionLabel("Developer")}
          {DEVELOPER_ITEMS.map(renderNavLink)}
        </div>
      </div>

      {/* FOOTER — upgrade card only (Settings / Profile / Logout now live in
          the profile menu at the top right of the header) */}

      <div className="p-3 border-t border-border mt-auto shrink-0">
        <div className="relative overflow-hidden rounded-2xl border border-[#0284c7]/20 bg-gradient-to-br from-[#0284c7]/10 via-background to-indigo-500/10 p-3.5">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#0284c7]/15 blur-2xl" />
          <div className="absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-fuchsia-500/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0284c7] text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  Upgrade to Pro
                </p>

                <p className="text-[10px] text-muted-text">
                  Unlock more possibilities
                </p>
              </div>
            </div>

            <p className="mb-3 text-[11px] leading-relaxed text-muted-text">
              Get advanced analytics, unlimited features and more control over
              your store.
            </p>

            <UpgradeButton />
          </div>
        </div>
      </div>
    </aside>
  );
};

/**
 * Attention-grabbing CTA: gradient, glow, a light sweep that repeats every few
 * seconds, a nudging arrow on hover. Links to the plans page.
 */
function UpgradeButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link
        href="/dashboard/upgrade"
        className="
          group
          relative
          flex
          w-full
          items-center
          justify-center
          gap-2
          overflow-hidden
          rounded-xl
          bg-gradient-to-r
          from-[#0284c7]
          via-indigo-500
          to-fuchsia-500
          px-3
          py-2.5
          text-xs
          font-bold
          text-white
          shadow-lg
          shadow-indigo-500/30
          ring-1
          ring-white/20
          transition-shadow
          hover:shadow-xl
          hover:shadow-fuchsia-500/40
        "
      >
        {/* moving light sweep */}
        <motion.span
          aria-hidden
          className="
            pointer-events-none
            absolute
            inset-y-0
            -left-1/2
            w-1/3
            -skew-x-12
            bg-white/35
            blur-sm
          "
          animate={{ x: ["0%", "550%"] }}
          transition={{
            duration: 1.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2.2,
          }}
        />

        <motion.span
          className="relative flex"
          animate={{ scale: [1, 1.25, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
        >
          <Zap className="h-3.5 w-3.5 fill-white" />
        </motion.span>

        <span className="relative">Upgrade Now</span>

        <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}