"use client";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TenantProvider } from "@/context/TenantContext";
import { UserProvider } from "@/context/UserContext";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
    <TenantProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      {/* <SearchModal />
      <FloatingActionButton /> */}
    </TenantProvider>
    </UserProvider>
  );
};

export default DashboardLayout;
