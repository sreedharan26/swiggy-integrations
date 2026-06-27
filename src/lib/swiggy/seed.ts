import type {
  Address,
  Coupon,
  DineoutRestaurant,
  MenuItem,
  Order,
  Product,
  Restaurant,
  Slot,
  UserProfile,
} from "./types";

/**
 * Fixed "current month" so the demo is deterministic regardless of real date.
 * Spends/health screens treat this as "this month".
 */
export const CURRENT_MONTH = "2025-06";
export const CURRENT_MONTH_LABEL = "June 2025";

export const USER: UserProfile = {
  id: "u_aarav",
  name: "Aarav",
  city: "Bengaluru",
  monthlyBudget: 8000,
};

export const ADDRESSES: Address[] = [
  {
    id: "addr_home",
    label: "Home",
    line: "Indiranagar, Bengaluru",
    lat: 12.9719,
    lng: 77.6412,
    isDefault: true,
  },
  {
    id: "addr_work",
    label: "Work",
    line: "Koramangala, Bengaluru",
    lat: 12.9352,
    lng: 77.6245,
    isDefault: false,
  },
];

/* ----------------------------- Food delivery ----------------------------- */

export const RESTAURANTS: Restaurant[] = [
  { id: "r_behrouz", name: "Behrouz Biryani", cuisines: ["Biryani", "Mughlai", "North Indian"], rating: 4.6, ratingCount: 4200, costForTwo: 500, etaMinutes: 30, distanceKm: 1.8, emoji: "🍛", area: "Indiranagar" },
  { id: "r_pizzaexp", name: "Pizza Express", cuisines: ["Pizza", "Italian", "Desserts"], rating: 4.4, ratingCount: 2100, costForTwo: 700, etaMinutes: 30, distanceKm: 2.2, emoji: "🍕", area: "Indiranagar" },
  { id: "r_noodle", name: "Noodle House", cuisines: ["Asian", "Pan-Asian", "Thai"], rating: 4.3, ratingCount: 1500, costForTwo: 600, etaMinutes: 35, distanceKm: 2.6, emoji: "🍜", area: "Domlur" },
  { id: "r_meghana", name: "Meghana Foods", cuisines: ["Andhra", "Biryani", "South Indian"], rating: 4.5, ratingCount: 9800, costForTwo: 650, etaMinutes: 38, distanceKm: 3.1, emoji: "🍗", area: "Koramangala" },
  { id: "r_leon", name: "Leon Grill", cuisines: ["Grill", "Rolls", "Kebab"], rating: 4.2, ratingCount: 1200, costForTwo: 450, etaMinutes: 28, distanceKm: 1.5, emoji: "🥙", area: "Indiranagar" },
  { id: "r_greenbowl", name: "The Green Bowl", cuisines: ["Healthy", "Salads", "Continental"], rating: 4.4, ratingCount: 900, costForTwo: 550, etaMinutes: 32, distanceKm: 2.0, emoji: "🥗", area: "Indiranagar" },
];

export const MENU_ITEMS: MenuItem[] = [
  // Behrouz
  { id: "m_b1", restaurantId: "r_behrouz", name: "Chicken Dum Biryani", category: "Biryani", price: 350, isVeg: false, calories: 720, tags: ["biryani", "rice"] },
  { id: "m_b2", restaurantId: "r_behrouz", name: "Paneer Biryani", category: "Biryani", price: 320, isVeg: true, calories: 680, tags: ["biryani", "paneer"] },
  { id: "m_b3", restaurantId: "r_behrouz", name: "Phirni", category: "Dessert", price: 120, isVeg: true, calories: 300, tags: ["dessert", "sweet"] },
  // Pizza Express
  { id: "m_p1", restaurantId: "r_pizzaexp", name: "Margherita Pizza", category: "Pizza", price: 300, isVeg: true, calories: 800, tags: ["pizza", "cheese"] },
  { id: "m_p2", restaurantId: "r_pizzaexp", name: "Pepperoni Pizza", category: "Pizza", price: 420, isVeg: false, calories: 950, tags: ["pizza"] },
  { id: "m_p3", restaurantId: "r_pizzaexp", name: "Choco Lava Cake", category: "Dessert", price: 110, isVeg: true, calories: 380, tags: ["dessert", "sweet"] },
  // Noodle House
  { id: "m_n1", restaurantId: "r_noodle", name: "Veg Hakka Noodles", category: "Noodles", price: 240, isVeg: true, calories: 560, tags: ["noodles"] },
  { id: "m_n2", restaurantId: "r_noodle", name: "Chicken Thai Curry", category: "Curry", price: 320, isVeg: false, calories: 600, tags: ["curry", "thai"] },
  // Meghana
  { id: "m_meg1", restaurantId: "r_meghana", name: "Special Chicken Biryani", category: "Biryani", price: 360, isVeg: false, calories: 780, tags: ["biryani"] },
  { id: "m_meg2", restaurantId: "r_meghana", name: "Veg Biryani", category: "Biryani", price: 280, isVeg: true, calories: 650, tags: ["biryani"] },
  // Leon Grill
  { id: "m_l1", restaurantId: "r_leon", name: "Chicken Seekh Roll", category: "Rolls", price: 180, isVeg: false, calories: 450, tags: ["roll", "grill"] },
  { id: "m_l2", restaurantId: "r_leon", name: "Paneer Tikka Roll", category: "Rolls", price: 170, isVeg: true, calories: 430, tags: ["roll", "paneer"] },
  // Green Bowl
  { id: "m_g1", restaurantId: "r_greenbowl", name: "Grilled Chicken Salad", category: "Salad", price: 320, isVeg: false, calories: 380, tags: ["salad", "healthy", "grilled"] },
  { id: "m_g2", restaurantId: "r_greenbowl", name: "Quinoa Veggie Bowl", category: "Bowl", price: 300, isVeg: true, calories: 420, tags: ["bowl", "healthy"] },
];

/* -------------------------------- Dineout -------------------------------- */

export const DINEOUT_RESTAURANTS: DineoutRestaurant[] = [
  { id: "d_toit", name: "Toit", cuisines: ["Brewpub", "Continental", "North Indian"], rating: 4.6, ratingCount: 18000, costForTwo: 1600, distanceKm: 1.2, emoji: "🍻", area: "Indiranagar" },
  { id: "d_farzi", name: "Farzi Cafe", cuisines: ["Modern Indian", "North Indian"], rating: 4.5, ratingCount: 9000, costForTwo: 1800, distanceKm: 1.6, emoji: "🍽️", area: "Indiranagar" },
  { id: "d_olive", name: "Olive Bar & Kitchen", cuisines: ["European", "Mediterranean"], rating: 4.4, ratingCount: 5000, costForTwo: 2500, distanceKm: 1.8, emoji: "🫒", area: "Indiranagar" },
  { id: "d_truffles", name: "Truffles", cuisines: ["American", "Burgers", "Cafe"], rating: 4.5, ratingCount: 22000, costForTwo: 900, distanceKm: 2.4, emoji: "🍔", area: "Koramangala" },
  { id: "d_socials", name: "Socials", cuisines: ["Continental", "Finger Food"], rating: 4.3, ratingCount: 12000, costForTwo: 1200, distanceKm: 2.0, emoji: "🥂", area: "Koramangala" },
];

export const DINEOUT_SLOTS: Slot[] = [
  { time: "12:30", label: "12:30 PM", isFree: true },
  { time: "13:00", label: "1:00 PM", isFree: true },
  { time: "19:30", label: "7:30 PM", isFree: true },
  { time: "20:00", label: "8:00 PM", isFree: true },
  { time: "20:30", label: "8:30 PM", isFree: true },
  { time: "21:00", label: "9:00 PM", isFree: false },
];

/* -------------------------------- Instamart ------------------------------- */

export const PRODUCTS: Product[] = [
  { id: "p_chicken", name: "Chicken Curry Cut", brand: "Licious", category: "Meat", emoji: "🍗", keywords: ["chicken", "curry cut", "meat"], variants: [{ spin: "s_chicken_500", packSize: "500 g", price: 189 }, { spin: "s_chicken_1000", packSize: "1 kg", price: 359 }] },
  { id: "p_butter", name: "Pasteurised Butter", brand: "Amul", category: "Dairy", emoji: "🧈", keywords: ["butter"], variants: [{ spin: "s_butter_100", packSize: "100 g", price: 62 }, { spin: "s_butter_500", packSize: "500 g", price: 285 }] },
  { id: "p_tomato_puree", name: "Fresh Tomato Puree", brand: "Kissan", category: "Cooking Essentials", emoji: "🥫", keywords: ["tomato puree", "tomato", "puree"], variants: [{ spin: "s_tomp_200", packSize: "200 g", price: 40 }] },
  { id: "p_tomato", name: "Tomato", brand: "Fresh", category: "Vegetables", emoji: "🍅", keywords: ["tomato"], variants: [{ spin: "s_tom_500", packSize: "500 g", price: 25 }, { spin: "s_tom_1000", packSize: "1 kg", price: 45 }] },
  { id: "p_cream", name: "Fresh Cream", brand: "Amul", category: "Dairy", emoji: "🥛", keywords: ["cream", "fresh cream"], variants: [{ spin: "s_cream_100", packSize: "100 ml", price: 25 }, { spin: "s_cream_250", packSize: "250 ml", price: 58 }] },
  { id: "p_garam", name: "Garam Masala", brand: "Everest", category: "Spices", emoji: "🌶️", keywords: ["garam masala", "masala", "spice"], variants: [{ spin: "s_garam_100", packSize: "100 g", price: 78 }] },
  { id: "p_gg_paste", name: "Ginger Garlic Paste", brand: "Mother's Recipe", category: "Cooking Essentials", emoji: "🧄", keywords: ["ginger garlic paste", "ginger-garlic", "ginger", "garlic paste"], variants: [{ spin: "s_gg_200", packSize: "200 g", price: 55 }] },
  { id: "p_onion", name: "Onion", brand: "Fresh", category: "Vegetables", emoji: "🧅", keywords: ["onion"], variants: [{ spin: "s_onion_1000", packSize: "1 kg", price: 45 }] },
  { id: "p_potato", name: "Potato", brand: "Fresh", category: "Vegetables", emoji: "🥔", keywords: ["potato", "aloo"], variants: [{ spin: "s_potato_1000", packSize: "1 kg", price: 38 }] },
  { id: "p_capsicum", name: "Capsicum", brand: "Fresh", category: "Vegetables", emoji: "🫑", keywords: ["capsicum", "bell pepper"], variants: [{ spin: "s_caps_250", packSize: "250 g", price: 30 }] },
  { id: "p_garlic", name: "Garlic", brand: "Fresh", category: "Vegetables", emoji: "🧄", keywords: ["garlic"], variants: [{ spin: "s_garlic_200", packSize: "200 g", price: 35 }] },
  { id: "p_ginger", name: "Ginger", brand: "Fresh", category: "Vegetables", emoji: "🫚", keywords: ["ginger"], variants: [{ spin: "s_ginger_200", packSize: "200 g", price: 28 }] },
  { id: "p_paneer", name: "Fresh Paneer", brand: "Milky Mist", category: "Dairy", emoji: "🧀", keywords: ["paneer", "cottage cheese"], variants: [{ spin: "s_paneer_200", packSize: "200 g", price: 89 }, { spin: "s_paneer_500", packSize: "500 g", price: 199 }] },
  { id: "p_rice", name: "Basmati Rice", brand: "India Gate", category: "Staples", emoji: "🍚", keywords: ["rice", "basmati"], variants: [{ spin: "s_rice_1000", packSize: "1 kg", price: 120 }, { spin: "s_rice_5000", packSize: "5 kg", price: 560 }] },
  { id: "p_dal", name: "Toor Dal", brand: "Tata Sampann", category: "Staples", emoji: "🫘", keywords: ["dal", "toor", "lentil"], variants: [{ spin: "s_dal_1000", packSize: "1 kg", price: 165 }] },
  { id: "p_milk", name: "Toned Milk", brand: "Nandini", category: "Dairy", emoji: "🥛", keywords: ["milk"], variants: [{ spin: "s_milk_500", packSize: "500 ml", price: 26 }, { spin: "s_milk_1000", packSize: "1 L", price: 52 }] },
  { id: "p_eggs", name: "Farm Eggs", brand: "Eggoz", category: "Eggs", emoji: "🥚", keywords: ["egg", "eggs"], variants: [{ spin: "s_eggs_6", packSize: "6 pcs", price: 72 }, { spin: "s_eggs_12", packSize: "12 pcs", price: 135 }] },
  { id: "p_oil", name: "Sunflower Oil", brand: "Fortune", category: "Cooking Essentials", emoji: "🛢️", keywords: ["oil", "sunflower oil", "cooking oil"], variants: [{ spin: "s_oil_1000", packSize: "1 L", price: 145 }] },
  { id: "p_salt", name: "Iodised Salt", brand: "Tata", category: "Cooking Essentials", emoji: "🧂", keywords: ["salt"], variants: [{ spin: "s_salt_1000", packSize: "1 kg", price: 28 }] },
  { id: "p_atta", name: "Whole Wheat Atta", brand: "Aashirvaad", category: "Staples", emoji: "🌾", keywords: ["atta", "flour", "wheat"], variants: [{ spin: "s_atta_5000", packSize: "5 kg", price: 270 }] },
  { id: "p_curd", name: "Fresh Curd", brand: "Nandini", category: "Dairy", emoji: "🥛", keywords: ["curd", "yogurt", "dahi"], variants: [{ spin: "s_curd_400", packSize: "400 g", price: 35 }] },
  { id: "p_turmeric", name: "Turmeric Powder", brand: "Everest", category: "Spices", emoji: "🟡", keywords: ["turmeric", "haldi"], variants: [{ spin: "s_turm_100", packSize: "100 g", price: 32 }] },
  { id: "p_chilli", name: "Red Chilli Powder", brand: "Everest", category: "Spices", emoji: "🌶️", keywords: ["chilli", "chili", "red chilli", "mirchi"], variants: [{ spin: "s_chilli_100", packSize: "100 g", price: 45 }] },
  { id: "p_cumin", name: "Cumin Seeds", brand: "Tata Sampann", category: "Spices", emoji: "🌰", keywords: ["cumin", "jeera"], variants: [{ spin: "s_cumin_100", packSize: "100 g", price: 48 }] },
  { id: "p_spinach", name: "Spinach", brand: "Fresh", category: "Vegetables", emoji: "🥬", keywords: ["spinach", "palak", "leafy"], variants: [{ spin: "s_spinach_250", packSize: "250 g", price: 22 }] },
  { id: "p_bread", name: "Brown Bread", brand: "Modern", category: "Bakery", emoji: "🍞", keywords: ["bread"], variants: [{ spin: "s_bread_400", packSize: "400 g", price: 45 }] },
];

/* -------------------------------- Coupons -------------------------------- */

export const COUPONS: Coupon[] = [
  { code: "SAVE200", description: "₹200 off on orders above ₹599", maxDiscount: 200, minOrder: 599 },
  { code: "EATFIT15", description: "15% off (up to ₹120) on healthy meals", maxDiscount: 120, minOrder: 349 },
];

/* ------------------------------ Order history ----------------------------- */
/** June 2025 orders. Spends and health derive from this list. */
export const ORDERS: Order[] = [
  { id: "o_1", service: "instamart", merchant: "Instamart", date: "2025-06-01", amount: 820, discount: 80, items: [ { name: "Vegetables & fruits", quantity: 1, isVeg: true, calories: 0 }, { name: "Milk, eggs, bread", quantity: 1, isVeg: true, calories: 0 } ] },
  { id: "o_2", service: "food", merchant: "Leon Grill", date: "2025-06-02", amount: 360, discount: 45, items: [ { name: "Chicken Seekh Roll", quantity: 2, isVeg: false, calories: 450 } ] },
  { id: "o_3", service: "food", merchant: "Pizza Express", date: "2025-06-06", amount: 560, discount: 120, items: [ { name: "Margherita Pizza", quantity: 1, isVeg: true, calories: 800 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 } ] },
  { id: "o_4", service: "instamart", merchant: "Instamart", date: "2025-06-08", amount: 540, discount: 60, items: [ { name: "Snacks & beverages", quantity: 1, isVeg: true, calories: 0 } ] },
  { id: "o_5", service: "food", merchant: "Behrouz Biryani", date: "2025-06-11", amount: 650, discount: 130, items: [ { name: "Chicken Dum Biryani", quantity: 1, isVeg: false, calories: 720 }, { name: "Phirni", quantity: 1, isVeg: true, calories: 300 } ] },
  { id: "o_6", service: "dineout", merchant: "Truffles", date: "2025-06-14", amount: 600, discount: 200, items: [ { name: "Dinner for 2", quantity: 1, isVeg: false, calories: 0 } ] },
  { id: "o_7", service: "instamart", merchant: "Instamart", date: "2025-06-15", amount: 620, discount: 55, items: [ { name: "Fresh produce & staples", quantity: 1, isVeg: true, calories: 0 } ] },
  { id: "o_8", service: "food", merchant: "Meghana Foods", date: "2025-06-18", amount: 720, discount: 100, items: [ { name: "Special Chicken Biryani", quantity: 2, isVeg: false, calories: 780 } ] },
  { id: "o_9", service: "dineout", merchant: "Toit", date: "2025-06-21", amount: 360, discount: 0, items: [ { name: "Brunch for 2", quantity: 1, isVeg: true, calories: 0 } ] },
  { id: "o_10", service: "instamart", merchant: "Instamart", date: "2025-06-22", amount: 580, discount: 70, items: [ { name: "Groceries & essentials", quantity: 1, isVeg: true, calories: 0 } ] },
  { id: "o_11", service: "food", merchant: "Pizza Express", date: "2025-06-25", amount: 590, discount: 90, items: [ { name: "Pepperoni Pizza", quantity: 1, isVeg: false, calories: 950 }, { name: "Choco Lava Cake", quantity: 1, isVeg: true, calories: 380 } ] },
];
