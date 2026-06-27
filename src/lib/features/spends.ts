import { cached } from "@/lib/cache";
import { prisma, ensureDbReady } from "@/lib/db";
import { swiggy } from "@/lib/swiggy";
import { CURRENT_MONTH, CURRENT_MONTH_LABEL } from "@/lib/swiggy/seed";
import type { Coupon, Order, ServiceCategory } from "@/lib/swiggy/types";

export interface CategorySlice {
  category: ServiceCategory;
  label: string;
  amount: number;
  percent: number;
}

export interface WeekBucket {
  label: string;
  range: string;
  amount: number;
}

export interface SpendsSummary {
  monthLabel: string;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  totalSaved: number;
  categories: CategorySlice[];
  weeks: WeekBucket[];
  transactions: Order[];
  nudge: { active: boolean; coupon: Coupon | null };
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  food: "Food Delivery",
  instamart: "Instamart Groceries",
  dineout: "Dineout",
};

function weekOfMonth(isoDate: string): number {
  const day = Number(isoDate.slice(8, 10));
  return Math.min(3, Math.floor((day - 1) / 7));
}

export async function getSpendsSummary(): Promise<SpendsSummary> {
  await ensureDbReady();
  return cached("spends:summary:u_aarav:" + CURRENT_MONTH, 120, async () => {
    const [user, dbOrders] = await Promise.all([
      prisma.user.findUnique({ where: { id: "u_aarav" } }),
      prisma.order.findMany({
        where: { userId: "u_aarav", date: { startsWith: CURRENT_MONTH } },
        orderBy: { date: "desc" },
      }),
    ]);
    const budget = user?.monthlyBudget ?? 8000;

    const monthOrders: Order[] = dbOrders.map((o) => ({
      id: o.id,
      service: o.service as ServiceCategory,
      merchant: o.merchant,
      date: o.date,
      amount: o.amount,
      discount: o.discount,
      items: JSON.parse(o.items),
    }));

    const spent = monthOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalSaved = monthOrders.reduce((sum, o) => sum + o.discount, 0);
    const remaining = Math.max(0, budget - spent);
    const percentUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    const byCategory = new Map<ServiceCategory, number>();
    for (const o of monthOrders) {
      byCategory.set(o.service, (byCategory.get(o.service) ?? 0) + o.amount);
    }
    const categories: CategorySlice[] = (
      ["food", "instamart", "dineout"] as ServiceCategory[]
    )
      .map((category) => {
        const amount = byCategory.get(category) ?? 0;
        return {
          category,
          label: CATEGORY_LABELS[category],
          amount,
          percent: spent > 0 ? Math.round((amount / spent) * 100) : 0,
        };
      })
      .filter((c) => c.amount > 0);

    const weekRanges = ["1 - 7 Jun", "8 - 14 Jun", "15 - 21 Jun", "22 - 30 Jun"];
    const weekTotals = [0, 0, 0, 0];
    for (const o of monthOrders) weekTotals[weekOfMonth(o.date)] += o.amount;
    const weeks: WeekBucket[] = weekTotals.map((amount, i) => ({
      label: `Week ${i + 1}`,
      range: weekRanges[i],
      amount,
    }));

    let nudge: SpendsSummary["nudge"] = { active: false, coupon: null };
    if (percentUsed >= 80) {
      const coupons = await swiggy.fetch_food_coupons(599);
      const best = coupons.sort((a, b) => b.maxDiscount - a.maxDiscount)[0] ?? null;
      nudge = { active: true, coupon: best };
    }

    return {
      monthLabel: CURRENT_MONTH_LABEL,
      budget,
      spent,
      remaining,
      percentUsed,
      totalSaved,
      categories,
      weeks,
      transactions: monthOrders.slice(0, 6),
      nudge,
    };
  });
}
