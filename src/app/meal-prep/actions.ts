"use server";

import { buildMealPlan, type MealPlan } from "@/lib/features/mealprep";
import { swiggy } from "@/lib/swiggy";
import { orderStore } from "@/lib/store/orderStore";
import { prisma } from "@/lib/db";
import type { CartLine, PlacedOrder } from "@/lib/swiggy/types";

export async function generateMealPlanAction(
  query: string
): Promise<{ ok: true; plan: MealPlan } | { ok: false; error: string }> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return { ok: false, error: "Tell me what you'd like to cook." };
  }
  try {
    const plan = await buildMealPlan(trimmed);
    return { ok: true, plan };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function placeInstamartOrderAction(
  lines: CartLine[],
  dishName: string
): Promise<{ ok: true; order: PlacedOrder } | { ok: false; error: string }> {
  try {
    const order = orderStore.createFromCart(lines, dishName);
    await orderStore.add(order);
    return {
      ok: true,
      order: { orderId: order.id, service: "instamart", amount: order.amount, etaMinutes: 15 },
    };
  } catch {
    return { ok: false, error: "Failed to place order. Please try again." };
  }
}

export async function saveMealHistory(dish: string, servings: number): Promise<void> {
  await prisma.mealHistory.create({
    data: { userId: "u_aarav", dish, servings },
  });
}

export async function getMealHistory(): Promise<{ dish: string; servings: number }[]> {
  const rows = await prisma.mealHistory.findMany({
    where: { userId: "u_aarav" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return rows.map((r) => ({ dish: r.dish, servings: r.servings }));
}
