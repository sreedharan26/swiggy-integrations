"use client";

import Link from "next/link";
import { ShoppingCart, UtensilsCrossed, ChevronRight } from "lucide-react";
import type { ProductSuggestion, RestaurantSuggestion } from "@/lib/features/health";

export function InstamartSuggestions({ items }: { items: ProductSuggestion[] }) {
  if (items.length === 0) return null;

  return (
    <div className="card">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
        <ShoppingCart className="h-4 w-4 text-leaf-600" />
        Add these to your Instamart cart
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/meal-prep?search=${encodeURIComponent(item.name)}`}
            className="flex items-center gap-3 rounded-xl bg-black/[0.02] p-3 transition hover:bg-leaf-50 group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-50 text-xl group-hover:bg-white">
              {item.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.name}</p>
              <p className="text-xs text-ink-muted">{item.reason}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-muted shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RestaurantSuggestions({ items }: { items: RestaurantSuggestion[] }) {
  if (items.length === 0) return null;

  return (
    <div className="card">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
        <UtensilsCrossed className="h-4 w-4 text-brand" />
        Try healthier restaurant options
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/plan-evening`}
            className="flex items-center gap-3 rounded-xl bg-black/[0.02] p-3 transition hover:bg-brand-50 group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-xl group-hover:bg-white">
              {item.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-ink-muted">
                {item.cuisines.slice(0, 3).join(", ")} · {item.reason}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-muted shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
