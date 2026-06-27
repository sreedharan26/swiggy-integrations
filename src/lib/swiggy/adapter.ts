import type {
  Address, Booking, BookingTrackingInfo, Coupon,
  DineoutRestaurant, DineoutRestaurantDetails, FoodCart, FoodCartItem,
  InstamartCart, InstamartCartItem, MenuItem, NewAddress, OrderDetails,
  PlacedOrder, Product, Restaurant, Slot, TrackedOrder, TrackingInfo,
} from "./types";

/**
 * SwiggyAdapter mirrors Swiggy's MCP tools (Food, Instamart, Dineout).
 * Mock now, real MCP client later -- same interface, drop-in swap.
 * @see https://mcp.swiggy.com/builders/docs/reference/food/
 */
export interface SwiggyAdapter {
  // ─── Food: Discover ───
  search_restaurants(query?: string): Promise<Restaurant[]>;
  get_restaurant_menu(restaurantId: string): Promise<MenuItem[]>;
  search_menu(query: string): Promise<MenuItem[]>;

  // ─── Food: Cart ───
  update_food_cart(items: FoodCartItem[]): Promise<FoodCart>;
  get_food_cart(): Promise<FoodCart>;
  flush_food_cart(): Promise<void>;
  fetch_food_coupons(cartTotal: number): Promise<Coupon[]>;
  apply_food_coupon(code: string): Promise<FoodCart>;

  // ─── Food: Order ───
  place_food_order(): Promise<PlacedOrder>;

  // ─── Food: Track ───
  track_food_order(orderId: string): Promise<TrackingInfo>;
  get_food_orders(): Promise<TrackedOrder[]>;
  get_food_order_details(orderId: string): Promise<OrderDetails>;

  // ─── Instamart: Discover ───
  search_products(query: string): Promise<Product[]>;
  your_go_to_items(): Promise<Product[]>;

  // ─── Instamart: Cart ───
  update_cart(items: InstamartCartItem[]): Promise<InstamartCart>;
  get_cart(): Promise<InstamartCart>;
  clear_cart(): Promise<void>;

  // ─── Instamart: Order ───
  checkout(): Promise<PlacedOrder>;

  // ─── Instamart: Track ───
  track_order(orderId: string): Promise<TrackingInfo>;
  get_orders(): Promise<TrackedOrder[]>;
  get_order_details(orderId: string): Promise<OrderDetails>;

  // ─── Dineout: Find ───
  search_restaurants_dineout(query?: string): Promise<DineoutRestaurant[]>;
  get_restaurant_details(restaurantId: string): Promise<DineoutRestaurantDetails>;
  get_available_slots(restaurantId: string, date: string): Promise<Slot[]>;

  // ─── Dineout: Reserve ───
  book_table(args: { restaurantId: string; date: string; time: string; guests: number }): Promise<Booking>;

  // ─── Dineout: Manage ───
  get_booking_status(orderId: string): Promise<BookingTrackingInfo>;

  // ─── Cross-service ───
  get_addresses(): Promise<Address[]>;
  create_address(address: NewAddress): Promise<Address>;
  delete_address(addressId: string): Promise<void>;
}
