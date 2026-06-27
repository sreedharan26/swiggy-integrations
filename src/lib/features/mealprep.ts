import { generateRecipe, type Recipe } from "@/lib/ai/recipe";
import { swiggy } from "@/lib/swiggy";
import type { CartLine } from "@/lib/swiggy/types";

export interface MealPlan {
  recipe: Recipe;
  cart: { lines: CartLine[]; subtotal: number };
  matched: number;
  total: number;
}

/**
 * Turn a free-text cooking request into a recipe + an auto-built Instamart cart.
 *
 * AI does only the recipe (understand + extract). Mapping ingredients to real
 * products and building the cart is deterministic - the model never touches the
 * cart or money.
 */
export async function buildMealPlan(query: string): Promise<MealPlan> {
  const recipe = await generateRecipe(query);

  // Map each ingredient to a product (parallel tool calls).
  const results = await Promise.all(
    recipe.ingredients.map(async (ing) => {
      const products = await swiggy.search_products(ing.name);
      const product = products[0];
      if (!product) return null;
      const variant = product.variants[0];
      const line: CartLine = {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        spin: variant.spin,
        packSize: variant.packSize,
        price: variant.price,
        quantity: 1,
        emoji: product.emoji,
      };
      return line;
    })
  );

  const lines = results.filter((l): l is CartLine => l !== null);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return {
    recipe,
    cart: { lines, subtotal },
    matched: lines.length,
    total: recipe.ingredients.length,
  };
}
