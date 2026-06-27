"use client";

import { useState, useCallback } from "react";
import { HealthChat } from "./HealthChat";
import { InstamartSuggestions, RestaurantSuggestions } from "./SuggestionCards";
import type { ProductSuggestion, RestaurantSuggestion } from "@/lib/features/health";

interface Props {
  month: string;
  initialInstamart: ProductSuggestion[];
  initialRestaurants: RestaurantSuggestion[];
}

export function HealthInteractive({ month, initialInstamart, initialRestaurants }: Props) {
  const [extraInstamart, setExtraInstamart] = useState<ProductSuggestion[]>([]);
  const [extraRestaurants, setExtraRestaurants] = useState<RestaurantSuggestion[]>([]);

  const handleSuggestions = useCallback(
    (items: ProductSuggestion[], restaurants: RestaurantSuggestion[]) => {
      setExtraInstamart((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = items.filter((i) => !existingIds.has(i.id));
        return [...prev, ...newItems];
      });
      setExtraRestaurants((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newItems = restaurants.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newItems];
      });
    },
    [],
  );

  const mergedInstamart = dedup([...initialInstamart, ...extraInstamart]);
  const mergedRestaurants = dedupR([...initialRestaurants, ...extraRestaurants]);

  return (
    <>
      <HealthChat month={month} onSuggestions={handleSuggestions} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <InstamartSuggestions items={mergedInstamart} />
        <RestaurantSuggestions items={mergedRestaurants} />
      </div>
    </>
  );
}

function dedup(items: ProductSuggestion[]): ProductSuggestion[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

function dedupR(items: RestaurantSuggestion[]): RestaurantSuggestion[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}
