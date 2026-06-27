"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
