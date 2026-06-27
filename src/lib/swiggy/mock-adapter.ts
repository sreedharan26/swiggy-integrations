import type { SwiggyAdapter } from "./adapter";
import {
  ADDRESSES, COUPONS, DINEOUT_RESTAURANTS, DINEOUT_SLOTS,
  MENU_ITEMS, PRODUCTS, RESTAURANTS,
} from "./seed";
import { orderStore } from "@/lib/store/orderStore";
import type {
  Address, Booking, BookingTrackingInfo, Coupon,
  DineoutRestaurant, DineoutRestaurantDetails, FoodCart, FoodCartItem,
  InstamartCart, InstamartCartItem, MenuItem, NewAddress,
  OrderDetails, PlacedOrder, Product, Restaurant, Slot, TrackedOrder, TrackingInfo,
} from "./types";

const matches = (text: string, query: string) =>
  text.toLowerCase().includes(query.toLowerCase());

let mockFoodCart: FoodCart = {
  restaurantId: "", restaurantName: "", items: [],
  subtotal: 0, deliveryFee: 0, total: 0,
};

let mockInstamartCart: InstamartCart = {
  items: [], subtotal: 0, deliveryFee: 0, total: 0,
};

export const mockAdapter: SwiggyAdapter = {
  // ─── Food: Discover ───
  async search_restaurants(query?: string): Promise<Restaurant[]> {
    if (!query) return RESTAURANTS;
    return RESTAURANTS.filter((r) => matches(r.name, query) || r.cuisines.some((c) => matches(c, query)));
  },
  async get_restaurant_menu(restaurantId: string): Promise<MenuItem[]> {
    return MENU_ITEMS.filter((m) => m.restaurantId === restaurantId);
  },
  async search_menu(query: string): Promise<MenuItem[]> {
    return MENU_ITEMS.filter((m) => matches(m.name, query) || m.tags.some((t) => matches(t, query)));
  },

  // ─── Food: Cart ───
  async update_food_cart(items: FoodCartItem[]): Promise<FoodCart> {
    const menuItems = MENU_ITEMS.filter((m) => items.some((i) => i.menuItemId === m.id));
    const restaurant = menuItems[0] ? RESTAURANTS.find((r) => r.id === menuItems[0].restaurantId) : undefined;
    const subtotal = items.reduce((sum, item) => {
      const mi = MENU_ITEMS.find((m) => m.id === item.menuItemId);
      return sum + (mi?.price ?? 0) * item.quantity;
    }, 0);
    mockFoodCart = { restaurantId: restaurant?.id ?? "", restaurantName: restaurant?.name ?? "", items, subtotal, deliveryFee: 30, total: subtotal + 30 };
    return mockFoodCart;
  },
  async get_food_cart(): Promise<FoodCart> { return mockFoodCart; },
  async flush_food_cart(): Promise<void> {
    mockFoodCart = { restaurantId: "", restaurantName: "", items: [], subtotal: 0, deliveryFee: 0, total: 0 };
  },
  async fetch_food_coupons(cartTotal: number): Promise<Coupon[]> {
    return COUPONS.filter((c) => cartTotal >= c.minOrder);
  },
  async apply_food_coupon(code: string): Promise<FoodCart> {
    const coupon = COUPONS.find((c) => c.code === code);
    if (coupon) {
      const discount = Math.min(coupon.maxDiscount, mockFoodCart.subtotal * 0.15);
      mockFoodCart = { ...mockFoodCart, coupon: { code, discount }, total: mockFoodCart.subtotal + mockFoodCart.deliveryFee - discount };
    }
    return mockFoodCart;
  },

  // ─── Food: Order ───
  async place_food_order(): Promise<PlacedOrder> {
    const order = orderStore.createFromFoodCart(mockFoodCart);
    await orderStore.add(order);
    mockFoodCart = { restaurantId: "", restaurantName: "", items: [], subtotal: 0, deliveryFee: 0, total: 0 };
    return { orderId: order.id, service: "food", amount: order.amount, etaMinutes: 30 };
  },

  // ─── Food: Track ───
  async track_food_order(orderId: string): Promise<TrackingInfo> { return orderStore.track(orderId); },
  async get_food_orders(): Promise<TrackedOrder[]> {
    return (await orderStore.getAllTracked()).filter((o) => o.service === "food");
  },
  async get_food_order_details(orderId: string): Promise<OrderDetails> {
    const order = (await orderStore.getAllTracked()).find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    return { ...order, deliveryAddress: "Indiranagar, Bengaluru" };
  },

  // ─── Instamart: Discover ───
  async search_products(query: string): Promise<Product[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return PRODUCTS.filter((p) => matches(p.name, q) || p.keywords.some((k) => q.includes(k) || k.includes(q)));
  },
  async your_go_to_items(): Promise<Product[]> {
    const ids = ["p_milk", "p_eggs", "p_bread", "p_onion", "p_tomato", "p_curd"];
    return PRODUCTS.filter((p) => ids.includes(p.id));
  },

  // ─── Instamart: Cart ───
  async update_cart(items: InstamartCartItem[]): Promise<InstamartCart> {
    const lines = items.map((item) => {
      const product = PRODUCTS.find((p) => p.variants.some((v) => v.spin === item.spin));
      const variant = product?.variants.find((v) => v.spin === item.spin);
      return { productId: product?.id ?? "", name: product?.name ?? "", brand: product?.brand ?? "", spin: item.spin, packSize: variant?.packSize ?? "", price: variant?.price ?? 0, quantity: item.quantity, emoji: product?.emoji };
    });
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    mockInstamartCart = { items: lines, subtotal, deliveryFee: 25, total: subtotal + 25 };
    return mockInstamartCart;
  },
  async get_cart(): Promise<InstamartCart> { return mockInstamartCart; },
  async clear_cart(): Promise<void> {
    mockInstamartCart = { items: [], subtotal: 0, deliveryFee: 0, total: 0 };
  },

  // ─── Instamart: Order ───
  async checkout(): Promise<PlacedOrder> {
    const order = orderStore.createFromInstamartCart(mockInstamartCart);
    await orderStore.add(order);
    mockInstamartCart = { items: [], subtotal: 0, deliveryFee: 0, total: 0 };
    return { orderId: order.id, service: "instamart", amount: order.amount, etaMinutes: 15 };
  },

  // ─── Instamart: Track ───
  async track_order(orderId: string): Promise<TrackingInfo> { return orderStore.track(orderId); },
  async get_orders(): Promise<TrackedOrder[]> { return orderStore.getAllTracked(); },
  async get_order_details(orderId: string): Promise<OrderDetails> {
    const order = (await orderStore.getAllTracked()).find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    return { ...order, deliveryAddress: "Indiranagar, Bengaluru" };
  },

  // ─── Dineout: Find ───
  async search_restaurants_dineout(query?: string): Promise<DineoutRestaurant[]> {
    if (!query) return DINEOUT_RESTAURANTS;
    return DINEOUT_RESTAURANTS.filter((r) => matches(r.name, query) || r.cuisines.some((c) => matches(c, query)));
  },
  async get_restaurant_details(restaurantId: string): Promise<DineoutRestaurantDetails> {
    const r = DINEOUT_RESTAURANTS.find((r) => r.id === restaurantId);
    if (!r) throw new Error("Restaurant not found");
    return { ...r, address: `${r.area}, Bengaluru`, timings: "11 AM - 11 PM", deals: ["20% off total bill"] };
  },
  async get_available_slots(restaurantId: string, _date: string): Promise<Slot[]> {
    void restaurantId; void _date;
    return DINEOUT_SLOTS;
  },

  // ─── Dineout: Reserve ───
  async book_table(args: { restaurantId: string; date: string; time: string; guests: number }): Promise<Booking> {
    const restaurant = DINEOUT_RESTAURANTS.find((r) => r.id === args.restaurantId);
    return { bookingId: `bk_${Math.random().toString(36).slice(2, 9)}`, restaurantName: restaurant?.name ?? "Restaurant", date: args.date, time: args.time, guests: args.guests, status: "CONFIRMED" };
  },

  // ─── Dineout: Manage ───
  async get_booking_status(orderId: string): Promise<BookingTrackingInfo> {
    const order = (await orderStore.getAllTracked()).find((o) => o.id === orderId);
    return { bookingId: orderId, status: (order?.status as BookingTrackingInfo["status"]) ?? "confirmed", restaurantName: order?.merchant ?? "Restaurant", date: order?.date ?? "", time: "8:00 PM", guests: 4 };
  },

  // ─── Cross-service ───
  async get_addresses(): Promise<Address[]> { return ADDRESSES; },
  async create_address(address: NewAddress): Promise<Address> {
    const newAddr: Address = { id: `addr_${Date.now().toString(36)}`, ...address, isDefault: false };
    ADDRESSES.push(newAddr);
    return newAddr;
  },
  async delete_address(addressId: string): Promise<void> {
    const idx = ADDRESSES.findIndex((a) => a.id === addressId);
    if (idx >= 0) ADDRESSES.splice(idx, 1);
  },
};
