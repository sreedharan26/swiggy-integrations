import { shortText } from "@/lib/ai/explain";
import { cached } from "@/lib/cache";
import { swiggy } from "@/lib/swiggy";
import type { DineoutRestaurant, Restaurant, Slot } from "@/lib/swiggy/types";

export interface EveningPlan {
  reason: string;
  dineOut: DineoutRestaurant[];
  orderIn: Restaurant[];
  slots: Slot[];
}

export async function getEveningPlan(guests = 2): Promise<EveningPlan> {
  return cached(`evening:${guests}`, 300, async () => {
    const [dineRestaurants, deliveryRestaurants, slots] = await Promise.all([
      swiggy.search_restaurants_dineout(),
      swiggy.search_restaurants(),
      swiggy.get_available_slots("d_toit", "2025-06-27"),
    ]);

    const dineOut = dineRestaurants.slice().sort((a, b) => b.rating - a.rating);
    const orderIn = deliveryRestaurants.slice().sort((a, b) => b.rating - a.rating);

    const reason = await shortText(
      `evening-reason:${guests}`,
      "You are a concise dining concierge. In ONE sentence (max 22 words), " +
        "explain why these picks suit the user. Mention budget-friendliness, " +
        "good ratings, and variety. No preamble.",
      `Guests: ${guests}. Dine-out options: ${dineOut
        .slice(0, 3)
        .map((d) => d.name)
        .join(", ")}. Delivery options: ${orderIn
        .slice(0, 3)
        .map((r) => r.name)
        .join(", ")}.`,
      "Well-rated spots with varied cuisines, within your budget — perfect for a great evening."
    );

    return { reason, dineOut, orderIn, slots };
  });
}
