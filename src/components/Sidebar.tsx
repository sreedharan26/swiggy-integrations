"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Home, Wallet, UtensilsCrossed, CalendarClock, HeartPulse,
  Package, Bell, X,
} from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/spends", label: "Spends", icon: Wallet },
  { href: "/meal-prep", label: "Meal Prep", icon: UtensilsCrossed },
  { href: "/plan-evening", label: "Plan Evening", icon: CalendarClock },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/orders", label: "Orders", icon: Package },
];

interface OrdersSummary {
  version: number;
  activeOrders: Array<{ id: string; merchant: string; amount: number; status: string; etaMinutes: number | null }>;
  totalOrders: number;
  latest: { id: string; merchant: string; amount: number; status: string } | null;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const lastVersion = useRef(0);

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data: OrdersSummary = await res.json();
      setSummary(data);
      if (lastVersion.current > 0 && data.version > lastVersion.current && data.latest) {
        const msg = `${data.latest.merchant} - ${data.latest.status}`;
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
        if (pathnameRef.current === "/" || pathnameRef.current === "/spends") {
          router.refresh();
        }
      }
      lastVersion.current = data.version;
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 15_000);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    function onOrderPlaced() { poll(); }
    window.addEventListener("saathi:order-placed", onOrderPlaced);
    return () => window.removeEventListener("saathi:order-placed", onOrderPlaced);
  }, [poll]);

  const activeCount = summary?.activeOrders.length ?? 0;
  const topActive = summary?.activeOrders[0];

  const sidebarContent = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-black/[0.06] bg-white px-4 py-6">
      <div className="mb-8 flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg font-black text-white">
            S
          </span>
          <div className="leading-tight">
            <p className="text-xl font-extrabold text-brand">Saathi</p>
            <p className="text-[11px] text-ink-muted">AI food &amp; grocery companion</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.04] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        )}
      </div>

      {notification && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 animate-in slide-in-from-top">
          <Bell className="h-3.5 w-3.5" />
          {notification}
        </div>
      )}

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const showBadge = href === "/orders" && activeCount > 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-brand-50 text-brand"
                  : "text-ink-muted hover:bg-black/[0.03] hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
              {showBadge && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {topActive && (
        <Link href="/orders" onClick={onClose} className="mt-4 rounded-2xl bg-brand-50 p-4 transition hover:bg-brand/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Active Order</p>
            {topActive.etaMinutes && (
              <span className="text-xs font-bold text-brand">{topActive.etaMinutes} min</span>
            )}
          </div>
          <p className="mt-1 text-sm font-bold">{topActive.merchant}</p>
          <p className="text-xs text-ink-muted">
            {formatINR(topActive.amount)} · {topActive.status.replace(/_/g, " ")}
          </p>
        </Link>
      )}

      {!topActive && (
        <div className="mt-auto rounded-2xl bg-brand-50 p-4">
          <p className="text-sm font-bold text-brand-700">Eat better, spend smarter</p>
          <p className="mt-1 text-xs text-ink-muted">
            Smarter choices, one order at a time.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-black/[0.03] transition cursor-pointer">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 text-sm font-bold text-white shadow-sm">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">Aarav</p>
          <p className="text-[11px] text-ink-muted truncate">Bengaluru</p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile/tablet drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative h-full w-64 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
