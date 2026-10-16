"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";

import { useTenant } from "@/context/TenantContext";
import { useUser } from "@/context/UserContext";
import { NotificationsDropdown } from "@/components/modals/NotificationsDropdown";
import { useLowStockProducts } from "@/hooks/useLowStockProducts";
import UserAvatar from "@/components/common/UserAvatar";
import { logout } from "@/lib/api/auth.api";
import { clearAccessToken } from "@/lib/auth/session";
import { clearRefreshToken, getRefreshToken } from "@/lib/auth/token-storage";
import { useProfileImage } from "@/lib/profile-image";
import { custom_theme } from "@/lib/theme";

// Most specific routes first — the first matching prefix wins.
const PAGE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/dashboard/products", title: "Products" },
  { prefix: "/dashboard/options", title: "Product Options" },
  { prefix: "/dashboard/inventory", title: "Inventory" },
  { prefix: "/dashboard/orders", title: "Orders" },
  { prefix: "/dashboard/customers", title: "Customers" },
  { prefix: "/dashboard/staff", title: "Staff" },
  { prefix: "/dashboard/channels", title: "Channels" },
  { prefix: "/dashboard/api-keys", title: "API Keys" },
  { prefix: "/dashboard/settings", title: "Settings" },
  { prefix: "/dashboard/profile", title: "My Profile" },
  { prefix: "/dashboard/upgrade", title: "Upgrade" },
];

function getPageTitle(pathname: string): string {
  const match = PAGE_TITLES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match?.title ?? "Dashboard";
}

function formatRole(roleName?: string | null): string {
  if (!roleName) return "";

  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
}

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, role, clearUser } = useUser();
  const { setIsSearchOpen } = useTenant();

  const router = useRouter();
  const pathname = usePathname();

  const profileImage = useProfileImage(user?.id);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { lowStockProducts } = useLowStockProducts();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Must read the refresh token BEFORE clearing it — the backend now
      // needs it in the body to know which session to revoke.
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      clearAccessToken();
      clearRefreshToken();
      clearUser();

      router.replace("/login");
    }
  };

  const displayName = user?.name || "Account";

  return (
    <header
      className="
        h-16
        border-b
        border-border
        px-6
        flex
        items-center
        justify-between
        bg-background/80
        backdrop-blur-md
        sticky
        top-0
        z-30
        transition-colors
        duration-200
      "
    >
      {/* LEFT TITLE */}

      <h1
        className={`
          text-xl
          font-bold
          ${custom_theme.text.primary}
          tracking-tight
        `}
      >
        {getPageTitle(pathname)}
      </h1>

      {/* RIGHT CONTROLS */}

      <div className="flex items-center gap-3">
        {/* SEARCH */}

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="
            flex
            items-center
            gap-2
            px-3.5
            py-1.5
            rounded-lg
            border
            border-border
            bg-card
            text-sm
            text-muted-text
            hover:border-slate-400
            dark:hover:border-slate-700
            transition-all
            shadow-2xs
            w-64
            md:w-80
            justify-between
            group
          "
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-text group-hover:text-foreground transition-colors" />

            <span className="text-xs md:text-sm">Search anything...</span>
          </div>

          <kbd
            className="
              hidden
              sm:inline-block
              px-1.5
              py-0.5
              text-[10px]
              font-mono
              font-medium
              text-muted-text
              bg-border/50
              rounded
              border
              border-border
            "
          >
            ⌘K
          </kbd>
        </button>

        {/* THEME TOGGLE */}

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="
            p-2
            rounded-lg
            border
            border-border
            bg-card
            hover:bg-border/40
            text-muted-text
            hover:text-foreground
            transition-all
            relative
          "
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* NOTIFICATIONS */}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="
              p-2
              rounded-lg
              border
              border-border
              bg-card
              hover:bg-border/40
              text-muted-text
              hover:text-foreground
              transition-all
              relative
            "
          >
            <Bell className="w-4 h-4" />

            {lowStockProducts.length > 0 && (
              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  min-w-4
                  h-4
                  px-0.5
                  bg-amber-500
                  text-white
                  text-[10px]
                  font-bold
                  rounded-full
                  flex
                  items-center
                  justify-center
                  border-2
                  border-background
                "
              >
                {lowStockProducts.length > 9 ? "9+" : lowStockProducts.length}
              </span>
            )}
          </button>

          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* HELP */}

        <button
          type="button"
          title="Help & Support"
          className="
            p-2
            rounded-lg
            border
            border-border
            bg-card
            hover:bg-border/40
            text-muted-text
            hover:text-foreground
            transition-all
            hidden
            sm:flex
          "
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* PROFILE MENU */}

        <div ref={menuRef} className="relative pl-2 border-l border-border">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="
              flex
              items-center
              gap-2
              rounded-full
              py-1
              pl-1
              pr-2
              transition-colors
              hover:bg-border/40
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#0284c7]/40
            "
          >
            <UserAvatar
              name={user?.name}
              image={profileImage}
              className="h-8 w-8 text-xs"
            />

            <span className="hidden text-sm font-medium text-foreground lg:inline-block">
              {displayName}
            </span>

            <ChevronDown
              className={`
                hidden
                h-3.5
                w-3.5
                text-muted-text
                transition-transform
                duration-200
                lg:inline-block
                ${isMenuOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute
                  right-0
                  top-full
                  z-50
                  mt-2
                  w-64
                  origin-top-right
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-card
                  shadow-xl
                "
              >
                {/* Who's signed in */}

                <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                  <UserAvatar
                    name={user?.name}
                    image={profileImage}
                    className="h-10 w-10 text-sm"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.name ?? "Loading..."}
                    </p>

                    <p className="truncate text-xs text-muted-text">
                      {user?.email ?? ""}
                    </p>

                    {role?.name && (
                      <span className="mt-1 inline-block rounded-full bg-[#0284c7]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0284c7]">
                        {formatRole(role.name)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}

                <div className="p-1.5">
                  <Link
                    href="/dashboard/profile"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-foreground
                      transition-colors
                      hover:bg-border/40
                    "
                  >
                    <UserIcon className="h-4 w-4 text-muted-text" />
                    My Profile
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-foreground
                      transition-colors
                      hover:bg-border/40
                    "
                  >
                    <Settings className="h-4 w-4 text-muted-text" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-border p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-rose-600
                      transition-colors
                      hover:bg-rose-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}

                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
