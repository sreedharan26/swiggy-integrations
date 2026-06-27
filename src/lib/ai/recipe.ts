import { generateObject } from "ai";
import { z } from "zod";
import { cached } from "@/lib/cache";
import { getModel, hasAI } from "./provider";

export const RecipeSchema = z.object({
  dish: z.string().describe("The dish name, title-cased"),
  servings: z.number().int().min(1).max(20),
  cookTimeMinutes: z.number().int().min(5).max(240),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe("Plain ingredient name, e.g. 'Onion'"),
        quantity: z.string().describe("Human quantity, e.g. '500 g' or '2 tbsp'"),
      })
    )
    .min(3)
    .max(15),
  steps: z
    .array(z.string().describe("One concise cooking step"))
    .min(3)
    .max(10)
    .describe("5-10 concise cooking steps"),
});

export type Recipe = z.infer<typeof RecipeSchema>;

/* ----------------------- Deterministic fallback book ---------------------- */

type BaseRecipe = Omit<Recipe, "servings">;

const FALLBACK_BOOK: Record<string, BaseRecipe> = {
  "butter chicken": {
    dish: "Butter Chicken",
    cookTimeMinutes: 35,
    difficulty: "Medium",
    ingredients: [
      { name: "Chicken", quantity: "500 g" },
      { name: "Butter", quantity: "100 g" },
      { name: "Tomato puree", quantity: "200 g" },
      { name: "Cream", quantity: "100 ml" },
      { name: "Garam masala", quantity: "1 tbsp" },
      { name: "Ginger garlic paste", quantity: "2 tbsp" },
      { name: "Onion", quantity: "2 medium" },
    ],
    steps: [
      "Marinate chicken in curd, turmeric, and chilli powder for 30 minutes.",
      "Grill or pan-fry the marinated chicken until charred. Set aside.",
      "Heat butter in a pan, sauté onions until golden brown.",
      "Add ginger garlic paste and cook for 2 minutes.",
      "Add tomato puree and cook until oil separates.",
      "Add garam masala, salt, and sugar. Stir well.",
      "Add the grilled chicken pieces and simmer for 10 minutes.",
      "Finish with cream, stir gently, and serve hot with naan.",
    ],
  },
  "paneer butter masala": {
    dish: "Paneer Butter Masala",
    cookTimeMinutes: 30,
    difficulty: "Easy",
    ingredients: [
      { name: "Paneer", quantity: "400 g" },
      { name: "Butter", quantity: "100 g" },
      { name: "Tomato puree", quantity: "200 g" },
      { name: "Cream", quantity: "100 ml" },
      { name: "Garam masala", quantity: "1 tbsp" },
      { name: "Onion", quantity: "2 medium" },
    ],
    steps: [
      "Cut paneer into cubes and lightly pan-fry until golden. Set aside.",
      "Heat butter, sauté onions until translucent.",
      "Add tomato puree and cook on medium heat for 8-10 minutes.",
      "Blend the mixture into a smooth gravy.",
      "Return to pan, add garam masala, salt, and a pinch of sugar.",
      "Add paneer cubes and simmer for 5 minutes.",
      "Finish with cream and serve with butter naan or rice.",
    ],
  },
  "veg pulao": {
    dish: "Veg Pulao",
    cookTimeMinutes: 25,
    difficulty: "Easy",
    ingredients: [
      { name: "Basmati rice", quantity: "500 g" },
      { name: "Onion", quantity: "1 large" },
      { name: "Capsicum", quantity: "1" },
      { name: "Potato", quantity: "2 medium" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Oil", quantity: "3 tbsp" },
    ],
    steps: [
      "Wash and soak basmati rice for 20 minutes. Drain.",
      "Heat oil, add cumin seeds and let them splutter.",
      "Add sliced onions and sauté until light brown.",
      "Add diced potatoes, capsicum, and other veggies. Cook 3 minutes.",
      "Add rice, salt, and 2x water. Bring to a boil.",
      "Cover and cook on low heat for 15 minutes until rice is done.",
      "Fluff with a fork and serve hot with raita.",
    ],
  },
  "dal tadka": {
    dish: "Dal Tadka",
    cookTimeMinutes: 30,
    difficulty: "Easy",
    ingredients: [
      { name: "Toor dal", quantity: "300 g" },
      { name: "Onion", quantity: "1 medium" },
      { name: "Tomato", quantity: "2 medium" },
      { name: "Turmeric", quantity: "1 tsp" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Garlic", quantity: "4 cloves" },
    ],
    steps: [
      "Wash dal and pressure cook with turmeric and water for 3 whistles.",
      "Mash the cooked dal until smooth.",
      "For tadka: heat ghee, add cumin seeds and let them crackle.",
      "Add sliced garlic and cook until golden.",
      "Add chopped onions and tomatoes, cook until soft.",
      "Pour the tadka over the dal and mix well.",
      "Simmer for 5 minutes. Garnish with coriander and serve with rice.",
    ],
  },
  "chicken biryani": {
    dish: "Chicken Biryani",
    cookTimeMinutes: 60,
    difficulty: "Hard",
    ingredients: [
      { name: "Chicken", quantity: "1 kg" },
      { name: "Basmati rice", quantity: "750 g" },
      { name: "Onion", quantity: "4 large" },
      { name: "Curd", quantity: "200 g" },
      { name: "Garam masala", quantity: "2 tbsp" },
      { name: "Ginger garlic paste", quantity: "3 tbsp" },
    ],
    steps: [
      "Marinate chicken with curd, ginger garlic paste, and spices for 1 hour.",
      "Soak basmati rice for 30 minutes, then parboil until 70% done. Drain.",
      "Deep fry sliced onions until crispy and golden brown.",
      "In a heavy pot, layer marinated chicken at the bottom.",
      "Add a layer of parboiled rice, fried onions, saffron milk, and mint.",
      "Repeat layers. Seal the pot with dough or foil.",
      "Cook on high flame for 5 minutes, then low flame for 25 minutes (dum).",
      "Let it rest for 5 minutes. Gently mix and serve with raita.",
    ],
  },
};

function parseServings(text: string): number {
  const m = text.match(/(\d+)\s*(?:people|persons?|servings?|pax)?/i);
  const n = m ? Number(m[1]) : 4;
  return Math.min(20, Math.max(1, n || 4));
}

const DEFAULT_RECIPE: BaseRecipe = {
  dish: "Home-style Curry",
  cookTimeMinutes: 30,
  difficulty: "Easy",
  ingredients: [
    { name: "Onion", quantity: "2 medium" },
    { name: "Tomato", quantity: "3 medium" },
    { name: "Ginger garlic paste", quantity: "2 tbsp" },
    { name: "Garam masala", quantity: "1 tbsp" },
    { name: "Oil", quantity: "3 tbsp" },
  ],
  steps: [
    "Heat oil in a pan. Add cumin seeds and let them splutter.",
    "Add finely chopped onions and sauté until golden.",
    "Add ginger garlic paste and cook for 2 minutes.",
    "Add chopped tomatoes and cook until they turn mushy.",
    "Add garam masala, turmeric, salt and chilli powder.",
    "Add your choice of vegetables or protein with a cup of water.",
    "Cover and cook on medium heat for 15-20 minutes.",
    "Garnish with fresh coriander and serve hot with roti or rice.",
  ],
};

function fallbackRecipe(query: string): Recipe {
  const servings = parseServings(query);
  const q = query.toLowerCase();
  const key = Object.keys(FALLBACK_BOOK).find((k) => q.includes(k));
  const base: BaseRecipe = key ? FALLBACK_BOOK[key] : DEFAULT_RECIPE;
  return { ...base, servings };
}

/**
 * Generate a recipe from free text like "Butter Chicken for 4".
 * Uses Gemini when a key is present; otherwise a deterministic fallback.
 * Cached by normalized query (recipes are user-agnostic - safe to share).
 */
export async function generateRecipe(query: string): Promise<Recipe> {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  return cached(`recipe:${normalized}`, 60 * 60 * 24, async () => {
    if (!hasAI) return fallbackRecipe(query);
    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: RecipeSchema,
        system:
          "You are a concise Indian home-cooking assistant. Given a request, " +
          "extract the dish and number of servings, then return a simple " +
          "ingredient list scaled to the servings and 5-10 concise cooking steps. " +
          "Use common Indian grocery ingredient names. Keep it to pantry-buyable items.",
        prompt: query,
      });
      return object;
    } catch {
      return fallbackRecipe(query);
    }
  });
}
