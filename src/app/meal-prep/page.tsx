import { PageHeader } from "@/components/PageHeader";
import { MealPrepClient } from "./MealPrepClient";

export default function MealPrepPage() {
  return (
    <>
      <PageHeader
        title="Meal Prep to Cart"
        subtitle="Tell me what you want to cook and I'll build the grocery cart."
      />
      <MealPrepClient />
    </>
  );
}
