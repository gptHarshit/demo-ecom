"use client";

import * as React from "react";
import { Moon, Sun, Menu, X, Package } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ONBOARDING_ROUTES } from "@/app/constants/onboarding";

export function Navbar() {
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "Pricing", href: "#pricing" },
  ];

  const handleGetStarted = () => {
    router.push(ONBOARDING_ROUTES.SIGNUP_TOUR);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -15, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Package className="h-7 w-7 text-accent" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight">MyLeadKart</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <Link
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="rounded-full p-2 hover:bg-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>
          )}

          <div className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent"
            >
              Login
            </motion.button>
          </div>

          <div className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-full p-2 hover:bg-card transition-colors focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden overflow-hidden border-b border-border bg-background"
          >
            <div className="flex flex-col space-y-4 px-4 py-6 sm:px-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, type: "spring" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-foreground/90 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <button className="w-full rounded-xl bg-accent mb-2 px-5 py-3 text-center text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity">
                  Login
                </button>
                <button className="w-full rounded-xl bg-accent px-5 py-3 text-center text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity">
                  Get Started
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
