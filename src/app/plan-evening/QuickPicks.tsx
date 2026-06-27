"use client";

import { useRef } from "react";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { MenuItem, Restaurant } from "@/lib/swiggy/types";

interface QuickPicksProps {
  items: Array<{ menuItem: MenuItem; restaurant: Restaurant; orderCount: number }>;
}

export function QuickPicks({ items }: QuickPicksProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          Quick picks from your favorites
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/[0.04] hover:bg-black/[0.08] transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/[0.04] hover:bg-black/[0.08] transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {items.map(({ menuItem, restaurant }) => (
          <Link
            key={menuItem.id}
            href={`/plan-evening/menu/${restaurant.id}`}
            className="flex min-w-[180px] flex-col rounded-xl bg-white p-3 shadow-card ring-1 ring-black/5 transition hover:ring-brand/30 hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{restaurant.emoji}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${menuItem.isVeg ? "bg-leaf-600" : "bg-red-500"}`} />
            </div>
            <p className="text-sm font-semibold leading-tight">{menuItem.name}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{restaurant.name}</p>
            <p className="mt-auto pt-2 text-sm font-bold text-brand">{formatINR(menuItem.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
