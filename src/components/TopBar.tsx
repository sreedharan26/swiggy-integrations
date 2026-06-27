"use client";

import { usePathname } from "next/navigation";
import { Bell, MapPin, Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/spends": "Spends",
  "/meal-prep": "Meal Prep",
  "/plan-evening": "Plan My Evening",
  "/health": "Health",
  "/orders": "Orders",
};

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const greeting = getGreeting();

  return (
    <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/[0.04] transition lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-ink" />
        </button>
        <MapPin className="h-3.5 w-3.5 hidden sm:block" />
        <span className="hidden sm:inline">Indiranagar, Bengaluru</span>
      </div>

      <div className="flex items-center gap-4">
        <button aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/[0.04] transition">
          <Bell className="h-[18px] w-[18px] text-ink-muted" />
        </button>

        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-black/[0.04] transition cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 text-xs font-bold text-white shadow-sm">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight">{greeting}, Aarav</p>
            <p className="text-[10px] text-ink-muted leading-tight">
              {PAGE_TITLES[pathname] ?? "Saathi"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
