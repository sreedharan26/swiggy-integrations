import { PageHeader } from "@/components/PageHeader";
import { getEveningPlan } from "@/lib/features/planEvening";
import { getQuickPickItems } from "./actions";
import { PlanEveningClient } from "./PlanEveningClient";

export const dynamic = "force-dynamic";

export default async function PlanEveningPage() {
  const [plan, quickPicks] = await Promise.all([
    getEveningPlan(2),
    getQuickPickItems(),
  ]);

  return (
    <>
      <PageHeader title="Plan My Evening" />
      <PlanEveningClient
        initialDineOut={plan.dineOut}
        initialOrderIn={plan.orderIn}
        slots={plan.slots}
        reason={plan.reason}
        quickPicks={quickPicks}
      />
    </>
  );
}
