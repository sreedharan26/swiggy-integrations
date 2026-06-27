import { prisma } from "./db";

const globalSeed = globalThis as unknown as { seeded: boolean };

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

export async function ensureSeeded(): Promise<void> {
  if (globalSeed.seeded) return;
  globalSeed.seeded = true;

  try {
    const existing = await prisma.user.findFirst();
    if (existing) return;

    await prisma.user.create({
      data: { id: "u_aarav", name: "Aarav", city: "Bengaluru", monthlyBudget: 8000 },
    });

    for (const [, orders] of Object.entries(MONTHS_DATA)) {
      for (const o of orders) {
        await prisma.order.create({ data: { ...o, userId: "u_aarav", status: "delivered" } });
      }
    }
  } catch {
    globalSeed.seeded = false;
  }
}
