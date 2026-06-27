/**
 * Domain types for Saathi.
 *
 * These intentionally mirror the shapes returned by Swiggy's MCP tools so that
 * swapping the mock adapter for the real MCP client later is a drop-in change.
 * Field names follow Swiggy's tool vocabulary (Food / Instamart / Dineout).
 */

export type ServiceCategory = "food" | "instamart" | "dineout";

/* ----------------------------- Food delivery ----------------------------- */

export interface Restaurant {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  costForTwo: number;
  etaMinutes: number;
  distanceKm: number;
  emoji: string;
  area: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  /** Rough nutrition estimate used only for the gentle health report. */
  calories: number;
  tags: string[];
}

/* -------------------------------- Instamart ------------------------------- */

export interface ProductVariant {
  spin: string; // Swiggy product variant id ("spinId")
  packSize: string; // e.g. "500 g"
  price: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  variants: ProductVariant[];
  /** keywords used for simple ingredient -> product matching */
  keywords: string[];
}

export interface CartLine {
  productId: string;
  name: string;
  brand: string;
  spin: string;
  packSize: string;
  price: number;
  quantity: number;
  emoji?: string;
}

export interface Cart {
  lines: CartLine[];
  subtotal: number;
}

/* -------------------------------- Dineout -------------------------------- */

export interface DineoutRestaurant {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  costForTwo: number;
  distanceKm: number;
  emoji: string;
  area: string;
}

export interface Slot {
  time: string; // "20:00"
  label: string; // "8:00 PM"
  isFree: boolean;
}

export interface Booking {
  bookingId: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

/* ------------------------- Cross-service primitives ----------------------- */

export interface Address {
  id: string;
  label: string;
  line: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  isVeg: boolean;
  calories: number;
}

export interface Order {
  id: string;
  service: ServiceCategory;
  merchant: string;
  date: string;
  amount: number;
  discount: number;
  items: OrderItem[];
}

export interface Coupon {
  code: string;
  description: string;
  maxDiscount: number;
  minOrder: number;
}

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  monthlyBudget: number;
}

/* ----------------------------- Order Status ------------------------------ */

export type FoodOrderStatus =
  | "placed" | "confirmed" | "preparing"
  | "out_for_delivery" | "delivered" | "cancelled";

export type InstamartOrderStatus =
  | "placed" | "confirmed" | "packing"
  | "out_for_delivery" | "delivered" | "cancelled";

export type BookingTrackingStatus =
  | "confirmed" | "upcoming" | "checked_in" | "completed" | "cancelled";

export type AnyOrderStatus = FoodOrderStatus | InstamartOrderStatus | BookingTrackingStatus;

/* ------------------------------ Tracking --------------------------------- */

export interface StatusEntry { status: string; at: number }

export interface TrackingInfo {
  orderId: string;
  status: FoodOrderStatus | InstamartOrderStatus;
  etaMinutes: number | null;
  statusHistory: StatusEntry[];
  merchant: string;
  amount: number;
}

export interface BookingTrackingInfo {
  bookingId: string;
  status: BookingTrackingStatus;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
}

export interface TrackedOrder extends Order {
  status: AnyOrderStatus;
  placedAt: number;
  etaMinutes: number | null;
  statusHistory: StatusEntry[];
}

/* --------------------------------- Carts --------------------------------- */

export interface FoodCartItem {
  menuItemId: string;
  quantity: number;
  addons?: string[];
}

export interface FoodCart {
  restaurantId: string;
  restaurantName: string;
  items: FoodCartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  coupon?: { code: string; discount: number };
}

export interface InstamartCartItem { spin: string; quantity: number }

export interface InstamartCart {
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface PlacedOrder {
  orderId: string;
  service: ServiceCategory;
  amount: number;
  etaMinutes: number;
}

export interface OrderDetails extends Order {
  deliveryAddress?: string;
  paymentMethod?: string;
}

export interface DineoutRestaurantDetails extends DineoutRestaurant {
  address: string;
  timings: string;
  deals: string[];
}

export interface NewAddress {
  label: string;
  line: string;
  lat: number;
  lng: number;
}
