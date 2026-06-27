import { generateObject } from "ai";
import { z } from "zod";
import { cached, invalidateByPrefix } from "@/lib/cache";
import { getModel, hasAI } from "@/lib/ai/provider";
import { prisma, ensureDbReady } from "@/lib/db";
import { CURRENT_MONTH } from "@/lib/swiggy/seed";
import { PRODUCTS, RESTAURANTS, MENU_ITEMS } from "@/lib/swiggy/seed";
import type { OrderItem } from "@/lib/swiggy/types";

/* ─── Food-group classifier ─── */

export type FoodGroup = "Veggies" | "Meat/Eggs" | "Dairy" | "Fruits" | "Other";

const FOOD_GROUP_KEYWORDS: Record<FoodGroup, string[]> = {
  Veggies: [
    "spinach", "palak", "capsicum", "onion", "potato", "tomato", "vegetable",
    "broccoli", "beans", "produce", "salad", "quinoa", "veggie", "noodle",
    "rice", "dal", "garlic", "ginger", "staple", "pizza", "naan", "bread",
    "roll", "pulao", "biryani",
  ],
  "Meat/Eggs": [
    "chicken", "mutton", "seekh", "kebab", "egg", "fish", "prawn",
    "pepperoni", "meat", "grilled chicken", "burger",
  ],
  Dairy: [
    "paneer", "cream", "curd", "milk", "cheese", "butter", "phirni",
    "yogurt", "dahi", "lassi",
  ],
  Fruits: [
    "apple", "banana", "mango", "fruit", "orange", "grape", "watermelon",
    "papaya", "pomegranate",
  ],
  Other: [],
};

export function classifyItem(itemName: string): FoodGroup {
  const name = itemName.toLowerCase();
  for (const [group, keywords] of Object.entries(FOOD_GROUP_KEYWORDS) as [FoodGroup, string[]][]) {
    if (group === "Other") continue;
    if (keywords.some((k) => name.includes(k))) return group;
  }
  return "Other";
}

function classifyAllItems(items: OrderItem[]): Record<FoodGroup, number> {
  const counts: Record<FoodGroup, number> = { Veggies: 0, "Meat/Eggs": 0, Dairy: 0, Fruits: 0, Other: 0 };
  for (const item of items) {
    counts[classifyItem(item.name)] += item.quantity;
  }
  return counts;
}

/* ─── Nutrient classifier (for the balance bar) ─── */

export type Nutrient = "Protein" | "Carbs" | "Fats" | "Fiber" | "Sugar";

const NUTRIENT_KEYWORDS: Record<Nutrient, string[]> = {
  Protein: [
    "chicken", "mutton", "seekh", "kebab", "egg", "fish", "prawn", "paneer",
    "dal", "lentil", "soya", "tofu", "curd", "yogurt", "meat", "pepperoni",
    "biryani", "grilled chicken", "burger",
  ],
  Carbs: [
    "rice", "roti", "naan", "bread", "pizza", "pasta", "noodle", "roll",
    "paratha", "dosa", "idli", "pulao", "potato", "fries",
  ],
  Fats: [
    "butter", "cream", "cheese", "ghee", "oil", "fried", "mayo",
    "mayonnaise", "chips",
  ],
  Fiber: [
    "spinach", "palak", "capsicum", "broccoli", "beans", "salad", "quinoa",
    "veggie", "vegetable", "produce", "onion", "tomato", "apple", "banana",
    "mango", "fruit", "staple", "oats",
  ],
  Sugar: [
    "cake", "dessert", "sweet", "ice", "phirni", "gulab", "rasgulla",
    "chocolate", "choco", "cookie", "brownie", "mithai", "halwa",
  ],
};

function classifyNutrient(itemName: string): Nutrient {
  const name = itemName.toLowerCase();
  for (const [nutrient, keywords] of Object.entries(NUTRIENT_KEYWORDS) as [Nutrient, string[]][]) {
    if (keywords.some((k) => name.includes(k))) return nutrient;
  }
  return "Carbs";
}

function classifyNutrients(items: OrderItem[]): Record<Nutrient, number> {
  const counts: Record<Nutrient, number> = { Protein: 0, Carbs: 0, Fats: 0, Fiber: 0, Sugar: 0 };
  for (const item of items) {
    counts[classifyNutrient(item.name)] += item.quantity;
  }
  return counts;
}

/* ─── Food-group breakdown (for suggestion cards) ─── */

export interface FoodGroupSlice {
  group: FoodGroup;
  count: number;
  percent: number;
}

/* ─── Types ─── */

export interface NutritionSlice {
  label: string;
  percent: number;
}

export interface Suggestion {
  title: string;
  detail: string;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  reason: string;
}

export interface RestaurantSuggestion {
  id: string;
  name: string;
  emoji: string;
  cuisines: string[];
  reason: string;
}

export interface HealthReport {
  monthLabel: string;
  score: number;
  band: "Needs care" | "Balanced" | "Great";
  veggieVariety: number;
  hydration: number;
  homeCookedPct: number;
  orderedPct: number;
  nutrition: NutritionSlice[];
  foodGroups: FoodGroupSlice[];
  suggestions: Suggestion[];
  trend: { label: string; value: number }[];
  dessertCount: number;
  instamartSuggestions: ProductSuggestion[];
  restaurantSuggestions: RestaurantSuggestion[];
}

const SuggestionsSchema = z.object({
  summary: z.string(),
  suggestions: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .length(3),
});

function band(score: number): HealthReport["band"] {
  if (score >= 80) return "Great";
  if (score >= 60) return "Balanced";
  return "Needs care";
}

function normalize(counts: Record<string, number>): NutritionSlice[] {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([label, v]) => ({ label, percent: Math.round((v / total) * 100) }));
}

/* ─── Suggestions generator ─── */

function getHealthSuggestions(groups: Record<FoodGroup, number>): {
  instamartSuggestions: ProductSuggestion[];
  restaurantSuggestions: RestaurantSuggestion[];
} {
  const total = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
  const pct = (g: FoodGroup) => Math.round((groups[g] / total) * 100);

  const instamartSuggestions: ProductSuggestion[] = [];

  if (pct("Veggies") < 35) {
    const vegs = PRODUCTS.filter((p) => ["Vegetables", "Staples"].includes(p.category));
    for (const p of vegs.slice(0, 2)) {
      instamartSuggestions.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Boost your veggie intake" });
    }
  }
  if (pct("Dairy") < 15) {
    const dairy = PRODUCTS.filter((p) => p.category === "Dairy");
    for (const p of dairy.slice(0, 2)) {
      instamartSuggestions.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Add more dairy to your diet" });
    }
  }
  if (pct("Fruits") < 10) {
    const fruits = PRODUCTS.filter((p) => p.keywords.some((k) => ["apple", "banana", "mango", "fruit"].includes(k)));
    if (fruits.length === 0) {
      instamartSuggestions.push({ id: "generic_fruit", name: "Fresh Fruits", brand: "Seasonal", emoji: "🍎", reason: "Get your daily vitamins" });
    } else {
      for (const p of fruits.slice(0, 2)) {
        instamartSuggestions.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Get your daily vitamins" });
      }
    }
  }

  const restaurantSuggestions: RestaurantSuggestion[] = [];
  const healthyMenuItems = MENU_ITEMS.filter((m) => m.tags.some((t) => ["healthy", "salad", "grilled", "bowl"].includes(t)));
  const healthyRestaurantIds = [...new Set(healthyMenuItems.map((m) => m.restaurantId))];
  for (const rid of healthyRestaurantIds.slice(0, 3)) {
    const r = RESTAURANTS.find((r) => r.id === rid);
    if (r) {
      restaurantSuggestions.push({
        id: r.id, name: r.name, emoji: r.emoji, cuisines: r.cuisines,
        reason: "Healthy menu options available",
      });
    }
  }

  return { instamartSuggestions, restaurantSuggestions };
}

/* ─── Available months ─── */

export async function getAvailableMonths(): Promise<string[]> {
  return cached("health:months:u_aarav", 300, async () => {
    const snapshots = await prisma.healthSnapshot.findMany({
      where: { userId: "u_aarav" },
      select: { month: true },
      orderBy: { month: "desc" },
    });
    return snapshots.map((s) => s.month);
  });
}

/* ─── Main report generator ─── */

export async function getHealthReport(month?: string): Promise<HealthReport> {
  await ensureDbReady();
  const targetMonth = month ?? CURRENT_MONTH;
  return cached(`health:${targetMonth}`, 300, async () => {
    const snapshot = await prisma.healthSnapshot.findUnique({
      where: { userId_month: { userId: "u_aarav", month: targetMonth } },
    });

    if (snapshot) {
      const data = JSON.parse(snapshot.data) as HealthReport;
      if (!data.instamartSuggestions || !data.foodGroups) {
        const dbOrders = await prisma.order.findMany({
          where: { userId: "u_aarav", date: { startsWith: targetMonth } },
        });
        const allItems = dbOrders.flatMap((o) => JSON.parse(o.items) as OrderItem[]);
        const groups = classifyAllItems(allItems);
        if (!data.instamartSuggestions) {
          const { instamartSuggestions, restaurantSuggestions } = getHealthSuggestions(groups);
          data.instamartSuggestions = instamartSuggestions;
          data.restaurantSuggestions = restaurantSuggestions;
        }
        if (!data.foodGroups) {
          const groupTotal = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
          data.foodGroups = (Object.entries(groups) as [FoodGroup, number][])
            .filter(([, v]) => v > 0)
            .map(([group, count]) => ({ group, count, percent: Math.round((count / groupTotal) * 100) }));
        }
        if (!data.nutrition || data.nutrition.some((n) => ["Veggies", "Meat/Eggs", "Dairy", "Fruits"].includes(n.label))) {
          const nutrients = classifyNutrients(allItems);
          data.nutrition = normalize(nutrients);
        }
      }
      return data;
    }

    return computeAndSaveReport(targetMonth);
  });
}

async function computeAndSaveReport(month: string): Promise<HealthReport> {
  const dbOrders = await prisma.order.findMany({
    where: { userId: "u_aarav", date: { startsWith: month } },
    orderBy: { date: "desc" },
  });

  const allItems = dbOrders.flatMap((o) => JSON.parse(o.items) as OrderItem[]);
  const foodOrders = dbOrders.filter((o) => o.service === "food" || o.service === "dineout");
  const instamartOrders = dbOrders.filter((o) => o.service === "instamart");

  const foodItems = foodOrders.flatMap((o) => JSON.parse(o.items) as OrderItem[]);
  const vegItems = foodItems.filter((i) => i.isVeg).length;
  const totalFoodItems = foodItems.length || 1;
  const vegRatio = vegItems / totalFoodItems;
  const veggieVariety = Math.max(4, Math.min(9, Math.round(vegRatio * 10) + 3));
  const hydration = 6;
  const dessertCount = allItems.filter((i) => /cake|phirni|dessert|sweet|ice/i.test(i.name)).length;

  const totalOrders = dbOrders.length || 1;
  const homeCookedPct = Math.round((instamartOrders.length / totalOrders) * 100);
  const orderedPct = 100 - homeCookedPct;

  const nutrients = classifyNutrients(allItems);
  const nutrition = normalize(nutrients);

  const groups = classifyAllItems(allItems);
  const groupTotal = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
  const foodGroups: FoodGroupSlice[] = (Object.entries(groups) as [FoodGroup, number][])
    .filter(([, v]) => v > 0)
    .map(([group, count]) => ({ group, count, percent: Math.round((count / groupTotal) * 100) }));

  const score = Math.round(
    veggieVariety * 10 * 0.4 + hydration * 10 * 0.25 + vegRatio * 100 * 0.35
  );

  const trend = ["Week 1", "Week 2", "Week 3", "Week 4"].map((label, i) => ({
    label,
    value: Math.max(20, score - (3 - i) * 9),
  }));

  let suggestions: Suggestion[] = [
    { title: "Add one leafy green this week", detail: "A small change, big difference." },
    { title: "Swap 2 fried orders for grilled", detail: "Your heart and energy will thank you." },
    {
      title: dessertCount > 0 ? `You ordered dessert ${dessertCount} times - try fruit twice` : "Keep desserts occasional",
      detail: "Satisfy sweet cravings the natural way.",
    },
  ];

  if (hasAI) {
    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: SuggestionsSchema,
        system:
          "You are a warm, non-judgmental wellness companion. Based on the " +
          "user's monthly eating stats, write 3 short, gentle, encouraging " +
          "suggestions (title + one-line detail). Never shame. This is not medical advice.",
        prompt: JSON.stringify({ score, veggieVariety, hydration, homeCookedPct, dessertCount, nutrition }),
      });
      suggestions = object.suggestions;
    } catch {}
  }

  const { instamartSuggestions, restaurantSuggestions } = getHealthSuggestions(groups);

  const monthLabel = new Date(month + "-15").toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const report: HealthReport = {
    monthLabel,
    score,
    band: band(score),
    veggieVariety,
    hydration,
    homeCookedPct,
    orderedPct,
    nutrition,
    foodGroups,
    suggestions,
    trend,
    dessertCount,
    instamartSuggestions,
    restaurantSuggestions,
  };

  await prisma.healthSnapshot.upsert({
    where: { userId_month: { userId: "u_aarav", month } },
    update: { score, data: JSON.stringify(report) },
    create: { userId: "u_aarav", month, score, data: JSON.stringify(report) },
  });

  return report;
}

/* ─── AI Health Chat ─── */

export interface HealthChatResponse {
  answer: string;
  tips: string[];
  instamartItems: ProductSuggestion[];
  restaurants: RestaurantSuggestion[];
}

export async function askHealthQuestion(
  question: string,
  month?: string,
): Promise<HealthChatResponse> {
  const targetMonth = month ?? CURRENT_MONTH;
  const report = await getHealthReport(targetMonth);

  const context = {
    month: report.monthLabel,
    score: report.score,
    band: report.band,
    veggieVariety: report.veggieVariety,
    hydration: report.hydration,
    homeCookedPct: report.homeCookedPct,
    orderedPct: report.orderedPct,
    nutrition: report.nutrition,
    foodGroups: report.foodGroups,
    dessertCount: report.dessertCount,
    trend: report.trend,
  };

  const catalogProducts = PRODUCTS.map((p) => ({
    id: p.id, name: p.name, brand: p.brand, category: p.category, emoji: p.emoji,
  }));
  const catalogRestaurants = RESTAURANTS.map((r) => ({
    id: r.id, name: r.name, cuisines: r.cuisines, emoji: r.emoji,
    tags: MENU_ITEMS.filter((m) => m.restaurantId === r.id).flatMap((m) => m.tags).filter((v, i, a) => a.indexOf(v) === i),
  }));

  if (!hasAI) {
    const picks = pickFallbackActions(question, context);
    return {
      answer: buildFallbackAnswer(question, context),
      tips: report.suggestions.map((s) => s.title),
      ...picks,
    };
  }

  try {
    const HealthChatSchema = z.object({
      answer: z.string().describe("A warm, personalized 2-4 sentence answer based on their eating data. Be specific with numbers."),
      tips: z.array(z.string()).min(1).max(3).describe("1-3 actionable one-line tips"),
      suggestedProductIds: z.array(z.string()).max(3).describe("IDs of Instamart products from the catalog that would help the user. Pick items relevant to the question."),
      suggestedProductReasons: z.array(z.string()).max(3).describe("One-line reason for each suggested product, same order as IDs."),
      suggestedRestaurantIds: z.array(z.string()).max(2).describe("IDs of healthy restaurants from the catalog. Pick places whose cuisines/tags fit the question."),
      suggestedRestaurantReasons: z.array(z.string()).max(2).describe("One-line reason for each restaurant, same order as IDs."),
    });

    const { object } = await generateObject({
      model: getModel(),
      schema: HealthChatSchema,
      system:
        "You are Saathi, a warm and non-judgmental wellness companion on Swiggy. " +
        "The user is asking about their eating habits based on their order data. " +
        "Answer specifically using the data provided. Be encouraging, never shame. " +
        "Also suggest relevant products to add to their Instamart cart and healthy restaurants to try. " +
        "Only suggest products/restaurants from the provided catalogs. Use exact IDs.",
      prompt: JSON.stringify({
        question,
        userData: context,
        availableProducts: catalogProducts,
        availableRestaurants: catalogRestaurants,
      }),
    });

    const instamartItems: ProductSuggestion[] = (object.suggestedProductIds ?? [])
      .map((id, i) => {
        const p = PRODUCTS.find((x) => x.id === id);
        if (!p) return null;
        return { id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: object.suggestedProductReasons?.[i] ?? "Recommended for you" };
      })
      .filter((x): x is ProductSuggestion => x !== null);

    const restaurants: RestaurantSuggestion[] = (object.suggestedRestaurantIds ?? [])
      .map((id, i) => {
        const r = RESTAURANTS.find((x) => x.id === id);
        if (!r) return null;
        return { id: r.id, name: r.name, emoji: r.emoji, cuisines: r.cuisines, reason: object.suggestedRestaurantReasons?.[i] ?? "Healthy options available" };
      })
      .filter((x): x is RestaurantSuggestion => x !== null);

    return { answer: object.answer, tips: object.tips, instamartItems, restaurants };
  } catch {
    const picks = pickFallbackActions(question, context);
    return {
      answer: buildFallbackAnswer(question, context),
      tips: report.suggestions.map((s) => s.title),
      ...picks,
    };
  }
}

function pickFallbackActions(
  question: string,
  ctx: { nutrition: NutritionSlice[]; foodGroups: { group: FoodGroup; percent: number }[] },
): { instamartItems: ProductSuggestion[]; restaurants: RestaurantSuggestion[] } {
  const q = question.toLowerCase();
  const instamartItems: ProductSuggestion[] = [];
  const restaurants: RestaurantSuggestion[] = [];

  if (q.includes("protein") || q.includes("meat") || q.includes("egg")) {
    const items = PRODUCTS.filter((p) => p.keywords.some((k) => ["egg", "chicken", "paneer", "dal", "lentil"].includes(k)));
    for (const p of items.slice(0, 2)) {
      instamartItems.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Boost your protein" });
    }
  } else if (q.includes("veggie") || q.includes("vegetable") || q.includes("veg")) {
    const items = PRODUCTS.filter((p) => p.category === "Vegetables" || p.category === "Staples");
    for (const p of items.slice(0, 2)) {
      instamartItems.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Add more greens" });
    }
  } else if (q.includes("fruit") || q.includes("vitamin")) {
    const items = PRODUCTS.filter((p) => p.keywords.some((k) => ["apple", "banana", "mango", "fruit"].includes(k)));
    for (const p of items.slice(0, 2)) {
      instamartItems.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Get your daily vitamins" });
    }
  } else if (q.includes("sugar") || q.includes("sweet") || q.includes("dessert")) {
    const items = PRODUCTS.filter((p) => p.keywords.some((k) => ["fruit", "yogurt", "curd"].includes(k)));
    for (const p of items.slice(0, 2)) {
      instamartItems.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Healthier sweet alternatives" });
    }
  } else {
    const items = PRODUCTS.filter((p) => ["Vegetables", "Dairy"].includes(p.category));
    for (const p of items.slice(0, 2)) {
      instamartItems.push({ id: p.id, name: p.name, brand: p.brand, emoji: p.emoji, reason: "Improve your diet" });
    }
  }

  const healthyMenuItems = MENU_ITEMS.filter((m) => m.tags.some((t) => ["healthy", "salad", "grilled", "bowl"].includes(t)));
  const healthyRids = [...new Set(healthyMenuItems.map((m) => m.restaurantId))];
  for (const rid of healthyRids.slice(0, 2)) {
    const r = RESTAURANTS.find((x) => x.id === rid);
    if (r) restaurants.push({ id: r.id, name: r.name, emoji: r.emoji, cuisines: r.cuisines, reason: "Healthy menu options" });
  }

  return { instamartItems, restaurants };
}

function buildFallbackAnswer(
  question: string,
  ctx: { score: number; band: string; homeCookedPct: number; veggieVariety: number; dessertCount: number; nutrition: NutritionSlice[] },
): string {
  const q = question.toLowerCase();

  if (q.includes("score") || q.includes("health") || q.includes("doing")) {
    return `Your health score this month is ${ctx.score}/100, which puts you in the "${ctx.band}" zone. ${ctx.score >= 70 ? "You're doing well — keep it up!" : "There's room to improve, but small changes make a big difference!"}`;
  }
  if (q.includes("protein") || q.includes("nutrient") || q.includes("nutrition")) {
    const protein = ctx.nutrition.find((n) => n.label === "Protein");
    return `Your protein intake is at ${protein?.percent ?? 0}% of your diet this month. ${(protein?.percent ?? 0) < 25 ? "You might want to add more protein-rich foods like dal, eggs, or paneer." : "That's a solid protein intake!"}`;
  }
  if (q.includes("home") || q.includes("cook")) {
    return `${ctx.homeCookedPct}% of your orders this month were groceries (Instamart), suggesting home cooking. ${ctx.homeCookedPct > 40 ? "Great balance between cooking and ordering!" : "Try adding a couple more home-cooked meals each week."}`;
  }
  if (q.includes("sweet") || q.includes("dessert") || q.includes("sugar")) {
    return `You had desserts ${ctx.dessertCount} time${ctx.dessertCount !== 1 ? "s" : ""} this month. ${ctx.dessertCount > 3 ? "Maybe swap one or two for fresh fruit?" : "That's a reasonable amount — enjoy without guilt!"}`;
  }
  if (q.includes("veggie") || q.includes("vegetable") || q.includes("veg")) {
    return `Your veggie variety score is ${ctx.veggieVariety}/10 this month. ${ctx.veggieVariety >= 7 ? "Excellent variety in your greens!" : "Try adding more colourful vegetables — spinach, capsicum, or broccoli are easy adds."}`;
  }

  return `Your health score is ${ctx.score}/100 (${ctx.band}). You're at ${ctx.homeCookedPct}% home-cooked meals with a veggie variety of ${ctx.veggieVariety}/10. Ask me about specific areas like protein, sugar, or home cooking for detailed insights!`;
}

/** Called when an order reaches delivered status to invalidate the relevant snapshot. */
export async function invalidateHealthForMonth(month: string): Promise<void> {
  invalidateByPrefix(`health:${month}`);
  invalidateByPrefix("health:months:");
  await prisma.healthSnapshot.deleteMany({
    where: { userId: "u_aarav", month },
  }).catch(() => {});
}
