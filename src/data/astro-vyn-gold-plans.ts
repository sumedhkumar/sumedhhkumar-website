export const astroVynGoldPlans = [
  {
    id: "demo-2-months",
    name: "Demo - 2 Months",
    durationLabel: "2 months",
    originalPriceUsd: 399,
    priceUsd: 199,
    note: "Best for testing on demo before going live.",
  },
  {
    id: "six-months",
    name: "6 Months",
    durationLabel: "6 months",
    originalPriceUsd: 1099,
    priceUsd: 549,
    note: "For users who want a longer live evaluation period.",
  },
  {
    id: "one-year",
    name: "1 Year",
    durationLabel: "1 year",
    originalPriceUsd: 1999,
    priceUsd: 999,
    note: "Best value for serious users.",
  },
] as const;

export type AstroVynGoldPlan = (typeof astroVynGoldPlans)[number];
export type AstroVynGoldPlanId = AstroVynGoldPlan["id"];

export function getAstroVynGoldPlan(planId: string) {
  return astroVynGoldPlans.find((plan) => plan.id === planId) ?? null;
}

export function isAstroVynGoldPlanId(
  planId: string,
): planId is AstroVynGoldPlanId {
  return getAstroVynGoldPlan(planId) !== null;
}
