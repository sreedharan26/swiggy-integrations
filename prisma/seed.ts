import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

interface SeedOrder {
  id: string; service: string; merchant: string; date: string;
  amount: number; discount: number; items: string;
}

const MONTHS_DATA: Record<string, SeedOrder[]> = {
  "2025-01": [
    { id: "o_jan_1", service: "food", merchant: "Behrouz Biryani", date: "2025-01-03", amount: 650, discount: 100, items: JSON.stringify([{ name: "Chicken Dum Biryani", quantity: 1, isVeg: false, calories: 720 }]) },
    { id: "o_jan_2", service: "instamart", merchant: "Instamart", date: "2025-01-05", amount: 920, discount: 90, items: JSON.stringify([{ name: "Spinach", quantity: 1, isVeg: true, calories: 0 }, { name: "Tomato", quantity: 1, isVeg: true, calories: 0 }, { name: "Milk", quantity: 2, isVeg: true, calories: 0 }, { name: "Eggs", quantity: 1, isVeg: false, calories: 0 }]) },
    { id: "o_jan_3", service: "food", merchant: "Pizza Express", date: "2025-01-08", amount: 560, discount: 80, items: JSON.stringify([{ name: "Margherita Pizza", quantity: 1, isVeg: true, calories: 800 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 }]) },
    { id: "o_jan_4", service: "food", merchant: "Leon Grill", date: "2025-01-12", amount: 360, discount: 45, items: JSON.stringify([{ name: "Chicken Seekh Roll", quantity: 2, isVeg: false, calories: 450 }]) },
    { id: "o_jan_5", service: "instamart", merchant: "Instamart", date: "2025-01-15", amount: 750, discount: 65, items: JSON.stringify([{ name: "Paneer", quantity: 1, isVeg: true, calories: 0 }, { name: "Curd", quantity: 1, isVeg: true, calories: 0 }, { name: "Onion", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_jan_6", service: "dineout", merchant: "Truffles", date: "2025-01-18", amount: 900, discount: 180, items: JSON.stringify([{ name: "Burger & Fries", quantity: 2, isVeg: false, calories: 0 }]) },
    { id: "o_jan_7", service: "food", merchant: "Noodle House", date: "2025-01-22", amount: 480, discount: 60, items: JSON.stringify([{ name: "Veg Hakka Noodles", quantity: 1, isVeg: true, calories: 560 }]) },
    { id: "o_jan_8", service: "instamart", merchant: "Instamart", date: "2025-01-26", amount: 680, discount: 55, items: JSON.stringify([{ name: "Chicken Curry Cut", quantity: 1, isVeg: false, calories: 0 }, { name: "Potato", quantity: 1, isVeg: true, calories: 0 }, { name: "Rice", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_jan_9", service: "food", merchant: "Meghana Foods", date: "2025-01-29", amount: 720, discount: 110, items: JSON.stringify([{ name: "Special Chicken Biryani", quantity: 2, isVeg: false, calories: 780 }]) },
  ],
  "2025-02": [
    { id: "o_feb_1", service: "instamart", merchant: "Instamart", date: "2025-02-01", amount: 1050, discount: 110, items: JSON.stringify([{ name: "Spinach", quantity: 1, isVeg: true, calories: 0 }, { name: "Capsicum", quantity: 1, isVeg: true, calories: 0 }, { name: "Paneer", quantity: 1, isVeg: true, calories: 0 }, { name: "Eggs", quantity: 1, isVeg: false, calories: 0 }, { name: "Fruits", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_feb_2", service: "food", merchant: "The Green Bowl", date: "2025-02-04", amount: 620, discount: 70, items: JSON.stringify([{ name: "Grilled Chicken Salad", quantity: 1, isVeg: false, calories: 380 }, { name: "Quinoa Veggie Bowl", quantity: 1, isVeg: true, calories: 420 }]) },
    { id: "o_feb_3", service: "instamart", merchant: "Instamart", date: "2025-02-07", amount: 580, discount: 50, items: JSON.stringify([{ name: "Tomato", quantity: 1, isVeg: true, calories: 0 }, { name: "Onion", quantity: 1, isVeg: true, calories: 0 }, { name: "Curd", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_feb_4", service: "food", merchant: "Behrouz Biryani", date: "2025-02-10", amount: 640, discount: 120, items: JSON.stringify([{ name: "Paneer Biryani", quantity: 1, isVeg: true, calories: 680 }]) },
    { id: "o_feb_5", service: "instamart", merchant: "Instamart", date: "2025-02-14", amount: 880, discount: 80, items: JSON.stringify([{ name: "Milk", quantity: 2, isVeg: true, calories: 0 }, { name: "Banana", quantity: 1, isVeg: true, calories: 0 }, { name: "Apple", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_feb_6", service: "dineout", merchant: "Farzi Cafe", date: "2025-02-16", amount: 1200, discount: 200, items: JSON.stringify([{ name: "Dal Makhani", quantity: 1, isVeg: true, calories: 0 }, { name: "Butter Naan", quantity: 2, isVeg: true, calories: 0 }]) },
    { id: "o_feb_7", service: "food", merchant: "Leon Grill", date: "2025-02-20", amount: 350, discount: 40, items: JSON.stringify([{ name: "Paneer Tikka Roll", quantity: 2, isVeg: true, calories: 430 }]) },
    { id: "o_feb_8", service: "instamart", merchant: "Instamart", date: "2025-02-23", amount: 720, discount: 60, items: JSON.stringify([{ name: "Chicken Curry Cut", quantity: 1, isVeg: false, calories: 0 }, { name: "Garlic", quantity: 1, isVeg: true, calories: 0 }, { name: "Ginger", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_feb_9", service: "food", merchant: "Pizza Express", date: "2025-02-26", amount: 530, discount: 90, items: JSON.stringify([{ name: "Margherita Pizza", quantity: 1, isVeg: true, calories: 800 }]) },
    { id: "o_feb_10", service: "instamart", merchant: "Instamart", date: "2025-02-28", amount: 420, discount: 35, items: JSON.stringify([{ name: "Mango", quantity: 1, isVeg: true, calories: 0 }, { name: "Butter", quantity: 1, isVeg: true, calories: 0 }]) },
  ],
  "2025-03": [
    { id: "o_mar_1", service: "food", merchant: "Meghana Foods", date: "2025-03-02", amount: 720, discount: 100, items: JSON.stringify([{ name: "Special Chicken Biryani", quantity: 1, isVeg: false, calories: 780 }]) },
    { id: "o_mar_2", service: "instamart", merchant: "Instamart", date: "2025-03-05", amount: 850, discount: 75, items: JSON.stringify([{ name: "Potato", quantity: 1, isVeg: true, calories: 0 }, { name: "Onion", quantity: 1, isVeg: true, calories: 0 }, { name: "Tomato", quantity: 1, isVeg: true, calories: 0 }, { name: "Cream", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_mar_3", service: "food", merchant: "Noodle House", date: "2025-03-08", amount: 560, discount: 70, items: JSON.stringify([{ name: "Chicken Thai Curry", quantity: 1, isVeg: false, calories: 600 }, { name: "Veg Hakka Noodles", quantity: 1, isVeg: true, calories: 560 }]) },
    { id: "o_mar_4", service: "dineout", merchant: "Toit", date: "2025-03-11", amount: 800, discount: 0, items: JSON.stringify([{ name: "Brunch for 2", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_mar_5", service: "instamart", merchant: "Instamart", date: "2025-03-14", amount: 680, discount: 55, items: JSON.stringify([{ name: "Eggs", quantity: 1, isVeg: false, calories: 0 }, { name: "Bread", quantity: 1, isVeg: true, calories: 0 }, { name: "Milk", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_mar_6", service: "food", merchant: "The Green Bowl", date: "2025-03-17", amount: 300, discount: 30, items: JSON.stringify([{ name: "Quinoa Veggie Bowl", quantity: 1, isVeg: true, calories: 420 }]) },
    { id: "o_mar_7", service: "food", merchant: "Leon Grill", date: "2025-03-21", amount: 540, discount: 65, items: JSON.stringify([{ name: "Chicken Seekh Roll", quantity: 3, isVeg: false, calories: 450 }]) },
    { id: "o_mar_8", service: "instamart", merchant: "Instamart", date: "2025-03-25", amount: 950, discount: 90, items: JSON.stringify([{ name: "Spinach", quantity: 1, isVeg: true, calories: 0 }, { name: "Paneer", quantity: 1, isVeg: true, calories: 0 }, { name: "Curd", quantity: 1, isVeg: true, calories: 0 }, { name: "Apple", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_mar_9", service: "food", merchant: "Behrouz Biryani", date: "2025-03-28", amount: 650, discount: 130, items: JSON.stringify([{ name: "Chicken Dum Biryani", quantity: 1, isVeg: false, calories: 720 }, { name: "Phirni", quantity: 1, isVeg: true, calories: 300 }]) },
  ],
  "2025-04": [
    { id: "o_apr_1", service: "instamart", merchant: "Instamart", date: "2025-04-02", amount: 1100, discount: 100, items: JSON.stringify([{ name: "Chicken Curry Cut", quantity: 1, isVeg: false, calories: 0 }, { name: "Spinach", quantity: 1, isVeg: true, calories: 0 }, { name: "Tomato", quantity: 1, isVeg: true, calories: 0 }, { name: "Paneer", quantity: 1, isVeg: true, calories: 0 }, { name: "Banana", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_apr_2", service: "food", merchant: "Pizza Express", date: "2025-04-05", amount: 560, discount: 80, items: JSON.stringify([{ name: "Pepperoni Pizza", quantity: 1, isVeg: false, calories: 950 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 }]) },
    { id: "o_apr_3", service: "instamart", merchant: "Instamart", date: "2025-04-08", amount: 620, discount: 50, items: JSON.stringify([{ name: "Eggs", quantity: 1, isVeg: false, calories: 0 }, { name: "Milk", quantity: 1, isVeg: true, calories: 0 }, { name: "Curd", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_apr_4", service: "food", merchant: "Meghana Foods", date: "2025-04-11", amount: 360, discount: 40, items: JSON.stringify([{ name: "Veg Biryani", quantity: 1, isVeg: true, calories: 650 }]) },
    { id: "o_apr_5", service: "dineout", merchant: "Olive Bar & Kitchen", date: "2025-04-13", amount: 2500, discount: 300, items: JSON.stringify([{ name: "Mediterranean Platter", quantity: 1, isVeg: false, calories: 0 }, { name: "Grilled Fish", quantity: 1, isVeg: false, calories: 0 }]) },
    { id: "o_apr_6", service: "instamart", merchant: "Instamart", date: "2025-04-16", amount: 780, discount: 65, items: JSON.stringify([{ name: "Capsicum", quantity: 1, isVeg: true, calories: 0 }, { name: "Potato", quantity: 1, isVeg: true, calories: 0 }, { name: "Rice", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_apr_7", service: "food", merchant: "The Green Bowl", date: "2025-04-19", amount: 640, discount: 70, items: JSON.stringify([{ name: "Grilled Chicken Salad", quantity: 1, isVeg: false, calories: 380 }, { name: "Quinoa Veggie Bowl", quantity: 1, isVeg: true, calories: 420 }]) },
    { id: "o_apr_8", service: "food", merchant: "Leon Grill", date: "2025-04-22", amount: 350, discount: 40, items: JSON.stringify([{ name: "Paneer Tikka Roll", quantity: 2, isVeg: true, calories: 430 }]) },
    { id: "o_apr_9", service: "instamart", merchant: "Instamart", date: "2025-04-25", amount: 550, discount: 45, items: JSON.stringify([{ name: "Mango", quantity: 2, isVeg: true, calories: 0 }, { name: "Butter", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_apr_10", service: "food", merchant: "Behrouz Biryani", date: "2025-04-28", amount: 700, discount: 130, items: JSON.stringify([{ name: "Chicken Dum Biryani", quantity: 1, isVeg: false, calories: 720 }, { name: "Phirni", quantity: 1, isVeg: true, calories: 300 }]) },
  ],
  "2025-05": [
    { id: "o_may_1", service: "food", merchant: "Behrouz Biryani", date: "2025-05-01", amount: 640, discount: 120, items: JSON.stringify([{ name: "Paneer Biryani", quantity: 1, isVeg: true, calories: 680 }]) },
    { id: "o_may_2", service: "instamart", merchant: "Instamart", date: "2025-05-04", amount: 980, discount: 85, items: JSON.stringify([{ name: "Spinach", quantity: 1, isVeg: true, calories: 0 }, { name: "Tomato", quantity: 1, isVeg: true, calories: 0 }, { name: "Onion", quantity: 1, isVeg: true, calories: 0 }, { name: "Chicken Curry Cut", quantity: 1, isVeg: false, calories: 0 }]) },
    { id: "o_may_3", service: "food", merchant: "Noodle House", date: "2025-05-07", amount: 480, discount: 55, items: JSON.stringify([{ name: "Veg Hakka Noodles", quantity: 2, isVeg: true, calories: 560 }]) },
    { id: "o_may_4", service: "dineout", merchant: "Socials", date: "2025-05-10", amount: 1200, discount: 150, items: JSON.stringify([{ name: "Continental Platter", quantity: 1, isVeg: false, calories: 0 }]) },
    { id: "o_may_5", service: "instamart", merchant: "Instamart", date: "2025-05-13", amount: 870, discount: 70, items: JSON.stringify([{ name: "Eggs", quantity: 1, isVeg: false, calories: 0 }, { name: "Milk", quantity: 2, isVeg: true, calories: 0 }, { name: "Apple", quantity: 1, isVeg: true, calories: 0 }, { name: "Banana", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_may_6", service: "food", merchant: "Pizza Express", date: "2025-05-16", amount: 560, discount: 90, items: JSON.stringify([{ name: "Margherita Pizza", quantity: 1, isVeg: true, calories: 800 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 }]) },
    { id: "o_may_7", service: "instamart", merchant: "Instamart", date: "2025-05-19", amount: 650, discount: 55, items: JSON.stringify([{ name: "Paneer", quantity: 1, isVeg: true, calories: 0 }, { name: "Curd", quantity: 1, isVeg: true, calories: 0 }, { name: "Capsicum", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_may_8", service: "food", merchant: "Meghana Foods", date: "2025-05-22", amount: 720, discount: 100, items: JSON.stringify([{ name: "Special Chicken Biryani", quantity: 1, isVeg: false, calories: 780 }]) },
    { id: "o_may_9", service: "food", merchant: "The Green Bowl", date: "2025-05-25", amount: 300, discount: 30, items: JSON.stringify([{ name: "Grilled Chicken Salad", quantity: 1, isVeg: false, calories: 380 }]) },
    { id: "o_may_10", service: "instamart", merchant: "Instamart", date: "2025-05-28", amount: 590, discount: 50, items: JSON.stringify([{ name: "Garlic", quantity: 1, isVeg: true, calories: 0 }, { name: "Ginger", quantity: 1, isVeg: true, calories: 0 }, { name: "Rice", quantity: 1, isVeg: true, calories: 0 }]) },
  ],
  "2025-06": [
    { id: "o_1", service: "instamart", merchant: "Instamart", date: "2025-06-01", amount: 820, discount: 80, items: JSON.stringify([{ name: "Vegetables & fruits", quantity: 1, isVeg: true, calories: 0 }, { name: "Milk, eggs, bread", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_2", service: "food", merchant: "Leon Grill", date: "2025-06-02", amount: 360, discount: 45, items: JSON.stringify([{ name: "Chicken Seekh Roll", quantity: 2, isVeg: false, calories: 450 }]) },
    { id: "o_3", service: "food", merchant: "Pizza Express", date: "2025-06-06", amount: 560, discount: 120, items: JSON.stringify([{ name: "Margherita Pizza", quantity: 1, isVeg: true, calories: 800 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 }]) },
    { id: "o_4", service: "instamart", merchant: "Instamart", date: "2025-06-08", amount: 540, discount: 60, items: JSON.stringify([{ name: "Snacks & beverages", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_5", service: "food", merchant: "Behrouz Biryani", date: "2025-06-11", amount: 650, discount: 130, items: JSON.stringify([{ name: "Chicken Dum Biryani", quantity: 1, isVeg: false, calories: 720 }, { name: "Phirni", quantity: 1, isVeg: true, calories: 300 }]) },
    { id: "o_6", service: "dineout", merchant: "Truffles", date: "2025-06-14", amount: 600, discount: 200, items: JSON.stringify([{ name: "Dinner for 2", quantity: 1, isVeg: false, calories: 0 }]) },
    { id: "o_7", service: "instamart", merchant: "Instamart", date: "2025-06-15", amount: 620, discount: 55, items: JSON.stringify([{ name: "Fresh produce & staples", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_8", service: "food", merchant: "Meghana Foods", date: "2025-06-18", amount: 720, discount: 100, items: JSON.stringify([{ name: "Special Chicken Biryani", quantity: 2, isVeg: false, calories: 780 }]) },
    { id: "o_9", service: "dineout", merchant: "Toit", date: "2025-06-21", amount: 360, discount: 0, items: JSON.stringify([{ name: "Brunch for 2", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_10", service: "instamart", merchant: "Instamart", date: "2025-06-22", amount: 580, discount: 70, items: JSON.stringify([{ name: "Groceries & essentials", quantity: 1, isVeg: true, calories: 0 }]) },
    { id: "o_11", service: "food", merchant: "Pizza Express", date: "2025-06-25", amount: 590, discount: 90, items: JSON.stringify([{ name: "Pepperoni Pizza", quantity: 1, isVeg: false, calories: 950 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 }]) },
  ],
};

const FOOD_GROUP_KEYWORDS: Record<string, string[]> = {
  Veggies: ["spinach", "palak", "capsicum", "onion", "potato", "tomato", "vegetable", "broccoli", "beans", "produce", "salad", "quinoa", "veggie", "noodle", "rice", "dal", "garlic", "ginger"],
  "Meat/Eggs": ["chicken", "mutton", "seekh", "kebab", "egg", "fish", "prawn", "pepperoni", "biryani", "burger", "grilled chicken"],
  Dairy: ["paneer", "cream", "curd", "milk", "cheese", "butter", "phirni"],
  Fruits: ["apple", "banana", "mango", "fruit", "orange", "grape"],
};

function classifyItems(items: Array<{ name: string }>) {
  const counts: Record<string, number> = { Veggies: 0, "Meat/Eggs": 0, Dairy: 0, Fruits: 0, Other: 0 };
  for (const item of items) {
    const name = item.name.toLowerCase();
    let matched = false;
    for (const [group, keywords] of Object.entries(FOOD_GROUP_KEYWORDS)) {
      if (keywords.some((k) => name.includes(k))) { counts[group]++; matched = true; break; }
    }
    if (!matched) counts.Other++;
  }
  return counts;
}

function computeSnapshot(month: string, orders: SeedOrder[]) {
  const monthOrders = orders.filter((o) => o.date.startsWith(month));
  const allItems = monthOrders.flatMap((o) => JSON.parse(o.items) as Array<{ name: string; isVeg: boolean }>);
  const foodOrders = monthOrders.filter((o) => o.service === "food" || o.service === "dineout");
  const instamartOrders = monthOrders.filter((o) => o.service === "instamart");

  const foodItems = foodOrders.flatMap((o) => JSON.parse(o.items) as Array<{ name: string; isVeg: boolean }>);
  const vegItems = foodItems.filter((i) => i.isVeg).length;
  const totalFoodItems = foodItems.length || 1;
  const vegRatio = vegItems / totalFoodItems;
  const veggieVariety = Math.max(4, Math.min(9, Math.round(vegRatio * 10) + 3));
  const hydration = 5 + Math.floor(Math.random() * 3);
  const totalOrders = monthOrders.length || 1;
  const homeCookedPct = Math.round((instamartOrders.length / totalOrders) * 100);
  const orderedPct = 100 - homeCookedPct;
  const dessertCount = allItems.filter((i) => /cake|phirni|dessert|sweet|ice/i.test(i.name)).length;

  const groups = classifyItems(allItems);
  const totalClassified = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
  const nutrition = Object.entries(groups)
    .filter(([, v]) => v > 0)
    .map(([label, v]) => ({ label, percent: Math.round((v / totalClassified) * 100) }));

  const score = Math.round(veggieVariety * 10 * 0.4 + hydration * 10 * 0.25 + vegRatio * 100 * 0.35);
  const band = score >= 80 ? "Great" : score >= 60 ? "Balanced" : "Needs care";
  const trend = ["Week 1", "Week 2", "Week 3", "Week 4"].map((label, i) => ({
    label, value: Math.max(20, score - (3 - i) * 9),
  }));

  return {
    score,
    data: JSON.stringify({
      monthLabel: new Date(month + "-15").toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      score, band, veggieVariety, hydration, homeCookedPct, orderedPct,
      nutrition, dessertCount, trend,
      suggestions: [
        { title: "Add one leafy green this week", detail: "A small change, big difference." },
        { title: "Swap 2 fried orders for grilled", detail: "Your heart and energy will thank you." },
        { title: dessertCount > 0 ? `You ordered dessert ${dessertCount} times - try fruit twice` : "Keep desserts occasional", detail: "Satisfy sweet cravings the natural way." },
      ],
    }),
  };
}

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const user = await prisma.user.create({
    data: { id: "u_aarav", name: "Aarav", city: "Bengaluru", monthlyBudget: 8000 },
  });

  let totalOrders = 0;
  for (const [month, orders] of Object.entries(MONTHS_DATA)) {
    for (const o of orders) {
      await prisma.order.create({ data: { ...o, userId: user.id, status: "delivered" } });
    }
    totalOrders += orders.length;

    const snapshot = computeSnapshot(month, orders);
    await prisma.healthSnapshot.create({
      data: { userId: user.id, month, score: snapshot.score, data: snapshot.data },
    });
  }

  console.log(`Seeded user ${user.name} with ${totalOrders} orders across ${Object.keys(MONTHS_DATA).length} months.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
