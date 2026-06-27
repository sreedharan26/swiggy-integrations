"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { getModel, hasAI } from "@/lib/ai/provider";
import { prisma } from "@/lib/db";
import { swiggy } from "@/lib/swiggy";
import { RESTAURANTS, DINEOUT_RESTAURANTS, MENU_ITEMS } from "@/lib/swiggy/seed";
import type {
  Booking, Coupon, DineoutRestaurant, DineoutRestaurantDetails,
  FoodCart, FoodCartItem, MenuItem, PlacedOrder, Restaurant, Slot,
} from "@/lib/swiggy/types";

export async function searchDineoutRestaurants(query?: string): Promise<DineoutRestaurant[]> {
  try {
    return await swiggy.search_restaurants_dineout(query);
  } catch {
    return [];
  }
}

export async function searchDeliveryRestaurants(query?: string): Promise<Restaurant[]> {
  try {
    return await swiggy.search_restaurants(query);
  } catch {
    return [];
  }
}

export async function getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
  try {
    return await swiggy.get_restaurant_menu(restaurantId);
  } catch {
    return [];
  }
}

export async function getRestaurantDetails(restaurantId: string): Promise<DineoutRestaurantDetails> {
  return swiggy.get_restaurant_details(restaurantId);
}

export async function getSlots(restaurantId: string, date: string): Promise<Slot[]> {
  try {
    return await swiggy.get_available_slots(restaurantId, date);
  } catch {
    return [];
  }
}

export async function bookTable(args: {
  restaurantId: string; date: string; time: string; guests: number;
}): Promise<{ ok: true; booking: Booking } | { ok: false; error: string }> {
  try {
    const booking = await swiggy.book_table(args);
    return { ok: true, booking };
  } catch {
    return { ok: false, error: "Failed to book table. Please try again." };
  }
}

export async function updateFoodCart(items: FoodCartItem[]): Promise<{ ok: true; cart: FoodCart } | { ok: false; error: string }> {
  try {
    const cart = await swiggy.update_food_cart(items);
    return { ok: true, cart };
  } catch {
    return { ok: false, error: "Failed to update cart. Please try again." };
  }
}

export async function getFoodCoupons(cartTotal: number): Promise<Coupon[]> {
  try {
    return await swiggy.fetch_food_coupons(cartTotal);
  } catch {
    return [];
  }
}

export async function applyFoodCoupon(code: string): Promise<{ ok: true; cart: FoodCart } | { ok: false; error: string }> {
  try {
    const cart = await swiggy.apply_food_coupon(code);
    return { ok: true, cart };
  } catch {
    return { ok: false, error: "Invalid or expired coupon." };
  }
}

export async function placeFoodOrder(): Promise<{ ok: true; order: PlacedOrder } | { ok: false; error: string }> {
  try {
    const order = await swiggy.place_food_order();
    return { ok: true, order };
  } catch {
    return { ok: false, error: "Failed to place order. Please try again." };
  }
}

/* ─── AI Restaurant Suggestions ─── */

export interface AISuggestion {
  restaurantId: string;
  name: string;
  emoji: string;
  cuisines: string[];
  type: "dineout" | "delivery";
  reason: string;
  matchScore: number;
}

const SuggestionsSchema = z.object({
  picks: z.array(z.object({
    restaurantId: z.string(),
    type: z.enum(["dineout", "delivery"]),
    reason: z.string().describe("One-line reason this is a great pick (max 20 words)"),
    matchScore: z.number().int().min(1).max(100).describe("How well this matches the user's request, 1-100"),
  })).min(1).max(6),
});

export async function getAISuggestions(
  prompt: string,
  guests: number,
): Promise<AISuggestion[]> {
  const recentOrders = await prisma.order.findMany({
    where: { userId: "u_aarav" },
    orderBy: { date: "desc" },
    take: 30,
  });

  const orderHistory = recentOrders.map((o) => ({
    service: o.service,
    merchant: o.merchant,
    items: JSON.parse(o.items) as Array<{ name: string }>,
    amount: o.amount,
  }));

  const cuisineFreq = new Map<string, number>();
  const merchantFreq = new Map<string, number>();
  for (const o of orderHistory) {
    merchantFreq.set(o.merchant, (merchantFreq.get(o.merchant) ?? 0) + 1);
    for (const item of o.items) {
      const name = item.name.toLowerCase();
      for (const r of [...RESTAURANTS, ...DINEOUT_RESTAURANTS]) {
        if (r.name.toLowerCase() === o.merchant.toLowerCase()) {
          for (const c of r.cuisines) {
            cuisineFreq.set(c, (cuisineFreq.get(c) ?? 0) + 1);
          }
        }
      }
    }
  }

  const topCuisines = [...cuisineFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c]) => c);

  const topMerchants = [...merchantFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([m]) => m);

  const allRestaurants = [
    ...DINEOUT_RESTAURANTS.map((r) => ({
      id: r.id, name: r.name, cuisines: r.cuisines, rating: r.rating,
      costForTwo: r.costForTwo, area: r.area, type: "dineout" as const,
    })),
    ...RESTAURANTS.map((r) => ({
      id: r.id, name: r.name, cuisines: r.cuisines, rating: r.rating,
      costForTwo: r.costForTwo, area: r.area, type: "delivery" as const,
    })),
  ];

  if (!hasAI) {
    return buildFallbackSuggestions(prompt, allRestaurants);
  }

  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: SuggestionsSchema,
      system:
        "You are a smart dining concierge for Bengaluru. Given the user's mood/request, " +
        "their order history preferences, and the available restaurants, pick the 3-5 best " +
        "matches. Consider cuisine match, budget fit for the group size, and variety. " +
        "Write a short, friendly reason for each pick. Return restaurantId values exactly " +
        "as given in the restaurant list.",
      prompt: JSON.stringify({
        userRequest: prompt,
        guests,
        favoriteCuisines: topCuisines,
        frequentRestaurants: topMerchants,
        availableRestaurants: allRestaurants,
      }),
    });

    return object.picks
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((pick) => {
        const r = allRestaurants.find((r) => r.id === pick.restaurantId);
        const seed = pick.type === "dineout"
          ? DINEOUT_RESTAURANTS.find((d) => d.id === pick.restaurantId)
          : RESTAURANTS.find((d) => d.id === pick.restaurantId);
        return {
          restaurantId: pick.restaurantId,
          name: r?.name ?? pick.restaurantId,
          emoji: seed?.emoji ?? "🍽️",
          cuisines: r?.cuisines ?? [],
          type: pick.type,
          reason: pick.reason,
          matchScore: pick.matchScore,
        };
      });
  } catch {
    return buildFallbackSuggestions(prompt, allRestaurants);
  }
}

function buildFallbackSuggestions(
  prompt: string,
  restaurants: Array<{ id: string; name: string; cuisines: string[]; rating: number; costForTwo: number; area: string; type: "dineout" | "delivery" }>,
): AISuggestion[] {
  const q = prompt.toLowerCase();
  const scored = restaurants.map((r) => {
    let score = r.rating * 10;
    if (r.cuisines.some((c) => q.includes(c.toLowerCase()))) score += 30;
    if (q.includes(r.name.toLowerCase())) score += 40;
    if (q.includes("cheap") || q.includes("budget")) score += r.costForTwo < 800 ? 20 : -10;
    if (q.includes("fancy") || q.includes("special")) score += r.costForTwo > 1500 ? 20 : -10;
    return { ...r, score };
  });

  const seed = [...RESTAURANTS, ...DINEOUT_RESTAURANTS];

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => ({
      restaurantId: r.id,
      name: r.name,
      emoji: seed.find((s) => s.id === r.id)?.emoji ?? "🍽️",
      cuisines: r.cuisines,
      type: r.type,
      reason: `Great ${r.cuisines[0]} spot in ${r.area} — rated ${r.rating}★`,
      matchScore: Math.round(r.score),
    }));
}

export async function getQuickPickItems(): Promise<
  Array<{ menuItem: MenuItem; restaurant: Restaurant; orderCount: number }>
> {
  const { cached } = await import("@/lib/cache");
  const { prisma } = await import("@/lib/db");
  const { MENU_ITEMS, RESTAURANTS } = await import("@/lib/swiggy/seed");

  return cached("quickpicks:u_aarav", 120, async () => {
    const recentOrders = await prisma.order.findMany({
      where: { userId: "u_aarav", service: "food" },
      orderBy: { date: "desc" },
      take: 30,
    });

    const itemCounts = new Map<string, number>();
    for (const order of recentOrders) {
      const items = JSON.parse(order.items) as Array<{ name: string }>;
      for (const item of items) {
        const name = item.name.toLowerCase();
        itemCounts.set(name, (itemCounts.get(name) ?? 0) + 1);
      }
    }

    const results: Array<{ menuItem: MenuItem; restaurant: Restaurant; orderCount: number }> = [];
    for (const [name, count] of itemCounts) {
      const mi = MENU_ITEMS.find((m) => m.name.toLowerCase() === name);
      if (!mi) continue;
      const rest = RESTAURANTS.find((r) => r.id === mi.restaurantId);
      if (!rest) continue;
      results.push({ menuItem: mi, restaurant: rest, orderCount: count });
    }

    return results.sort((a, b) => b.orderCount - a.orderCount).slice(0, 8);
  });
}
