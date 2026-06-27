import { prisma } from "@/lib/db";
import { cached, invalidateByPrefix } from "@/lib/cache";
import type {
  TrackedOrder, TrackingInfo, OrderItem, ServiceCategory,
  FoodOrderStatus, InstamartOrderStatus, AnyOrderStatus,
  CartLine, FoodCart, InstamartCart,
} from "@/lib/swiggy/types";
import { CURRENT_MONTH } from "@/lib/swiggy/seed";
import { invalidateHealthForMonth } from "@/lib/features/health";

type OrderListener = (order: TrackedOrder) => void;

const FOOD_FLOW: FoodOrderStatus[] = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
const FOOD_DELAYS = [3000, 8000, 15000, 25000];
const INSTAMART_FLOW: InstamartOrderStatus[] = ["placed", "confirmed", "packing", "out_for_delivery", "delivered"];
const INSTAMART_DELAYS = [3000, 10000, 18000, 30000];

function dbOrderToTracked(row: {
  id: string; service: string; merchant: string; date: string;
  amount: number; discount: number; status: string;
  placedAt: Date; items: string;
}): TrackedOrder {
  return {
    id: row.id,
    service: row.service as ServiceCategory,
    merchant: row.merchant,
    date: row.date,
    amount: row.amount,
    discount: row.discount,
    status: row.status as AnyOrderStatus,
    placedAt: row.placedAt.getTime(),
    etaMinutes: null,
    items: JSON.parse(row.items) as OrderItem[],
    statusHistory: [{ status: row.status, at: row.placedAt.getTime() }],
  };
}

class OrderStore {
  private activeOrders = new Map<string, TrackedOrder>();
  private listeners = new Set<OrderListener>();
  private _version = 0;

  get version() { return this._version; }

  async getAllTracked(): Promise<TrackedOrder[]> {
    const dbOrders = await cached("orders:all:u_aarav", 60, async () => {
      const rows = await prisma.order.findMany({
        where: { userId: "u_aarav" },
        orderBy: { placedAt: "desc" },
      });
      return rows.map(dbOrderToTracked);
    });
    const merged = [...dbOrders];
    for (const active of this.activeOrders.values()) {
      const idx = merged.findIndex((o) => o.id === active.id);
      if (idx >= 0) merged[idx] = active;
    }
    return merged;
  }

  getActive(): TrackedOrder[] {
    return [...this.activeOrders.values()]
      .filter((o) => o.status !== "delivered" && o.status !== "completed" && o.status !== "cancelled")
      .sort((a, b) => b.placedAt - a.placedAt);
  }

  track(orderId: string): TrackingInfo {
    const order = this.activeOrders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found in active orders`);
    return {
      orderId: order.id,
      status: order.status as TrackingInfo["status"],
      etaMinutes: order.etaMinutes,
      statusHistory: order.statusHistory,
      merchant: order.merchant,
      amount: order.amount,
    };
  }

  async add(order: TrackedOrder): Promise<void> {
    await prisma.order.create({
      data: {
        id: order.id,
        userId: "u_aarav",
        service: order.service,
        merchant: order.merchant,
        date: order.date,
        amount: order.amount,
        discount: order.discount,
        status: order.status,
        items: JSON.stringify(order.items),
      },
    });
    this.activeOrders.set(order.id, order);
    this._version++;
    invalidateByPrefix("spends:");
    invalidateByPrefix("orders:");
    invalidateByPrefix("quickpicks:");
    for (const fn of this.listeners) fn(order);
    this.scheduleProgression(order);
  }

  subscribe(fn: OrderListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private scheduleProgression(order: TrackedOrder): void {
    if (order.service === "dineout") return;
    const flow = order.service === "food" ? FOOD_FLOW : INSTAMART_FLOW;
    const delays = order.service === "food" ? FOOD_DELAYS : INSTAMART_DELAYS;

    let cumulative = 0;
    for (let i = 1; i < flow.length; i++) {
      cumulative += delays[i - 1];
      const nextStatus = flow[i];
      const etaAtStep = i < flow.length - 1
        ? Math.max(1, Math.round(delays.slice(i).reduce((a, b) => a + b, 0) / 60000))
        : null;

      setTimeout(async () => {
        order.status = nextStatus;
        order.etaMinutes = etaAtStep;
        order.statusHistory.push({ status: nextStatus, at: Date.now() });
        this._version++;
        invalidateByPrefix("spends:");
        await prisma.order.update({ where: { id: order.id }, data: { status: nextStatus } });
        if (nextStatus === "delivered") {
          this.activeOrders.delete(order.id);
          invalidateHealthForMonth(order.date.slice(0, 7));
        }
        for (const fn of this.listeners) fn(order);
      }, cumulative);
    }
  }

  createFromCart(lines: CartLine[], dishName: string): TrackedOrder {
    const amount = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const discount = Math.round(amount * 0.1);
    const items: OrderItem[] = lines.map((l) => ({ name: l.name, quantity: l.quantity, isVeg: true, calories: 0 }));
    const day = 22 + (Date.now() % 8);
    const demoDate = `${CURRENT_MONTH}-${String(day).padStart(2, "0")}`;
    const now = Date.now();
    return {
      id: `o_${now.toString(36)}`,
      service: "instamart",
      merchant: "Instamart",
      date: demoDate,
      amount,
      discount,
      items: [{ name: `Meal Prep: ${dishName}`, quantity: 1, isVeg: true, calories: 0 }, ...items],
      status: "placed",
      placedAt: now,
      etaMinutes: 15,
      statusHistory: [{ status: "placed", at: now }],
    };
  }

  createFromFoodCart(cart: FoodCart): TrackedOrder {
    const now = Date.now();
    const day = 22 + (now % 8);
    const demoDate = `${CURRENT_MONTH}-${String(day).padStart(2, "0")}`;
    return {
      id: `o_${now.toString(36)}`,
      service: "food",
      merchant: cart.restaurantName || "Restaurant",
      date: demoDate,
      amount: cart.total,
      discount: Math.round(cart.total * 0.1),
      items: cart.items.map((i) => ({ name: i.menuItemId, quantity: i.quantity, isVeg: true, calories: 0 })),
      status: "placed",
      placedAt: now,
      etaMinutes: 30,
      statusHistory: [{ status: "placed", at: now }],
    };
  }

  createFromInstamartCart(cart: InstamartCart): TrackedOrder {
    const now = Date.now();
    const day = 22 + (now % 8);
    const demoDate = `${CURRENT_MONTH}-${String(day).padStart(2, "0")}`;
    return {
      id: `o_${now.toString(36)}`,
      service: "instamart",
      merchant: "Instamart",
      date: demoDate,
      amount: cart.total,
      discount: Math.round(cart.total * 0.1),
      items: cart.items.map((l) => ({ name: l.name, quantity: l.quantity, isVeg: true, calories: 0 })),
      status: "placed",
      placedAt: now,
      etaMinutes: 15,
      statusHistory: [{ status: "placed", at: now }],
    };
  }
}

export const orderStore = new OrderStore();
