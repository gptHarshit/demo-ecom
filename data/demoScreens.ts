import { DemoScreen } from "@/types/demo";

import dashboardLight from "@/src/assets/images/landing_demo/dashboard_light.jpg";
import dashboardDark from "@/src/assets/images/landing_demo/dashboard_dark.jpg";

// Temporary (jab tak baaki screens ke screenshots nahi hain)
// Inhe baad me replace kar dena.

export const demoScreens: DemoScreen[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    images: {
      light: dashboardLight,
      dark: dashboardDark,
    },
  },
  {
    id: "inventory",
    label: "Inventory",
    images: {
      light: dashboardLight,
      dark: dashboardDark,
    },
  },
  {
    id: "orders",
    label: "Orders",
    images: {
      light: dashboardLight,
      dark: dashboardDark,
    },
  },
  {
    id: "staff",
    label: "Staff",
    images: {
      light: dashboardLight,
      dark: dashboardDark,
    },
  },
  {
    id: "upcoming",
    label: "Upcoming Features",
    images: {
      light: dashboardLight,
      dark: dashboardDark,
    },
  },
];