export const subscriptionAgentSlugs = ["astro-vyn-gold", "sentinel-vyn"] as const;

export type SubscriptionAgentSlug = (typeof subscriptionAgentSlugs)[number];

export const agentSubscriptionPlans = [
  {
    id: "demo-2-months",
    name: "Demo - 2 Months",
    durationLabel: "2 Months",
    originalPriceUsd: 399,
    priceUsd: 199,
    note: "For demo testing and workflow evaluation before live use.",
  },
  {
    id: "six-months",
    name: "6 Months",
    durationLabel: "6 Months",
    originalPriceUsd: 1099,
    priceUsd: 549,
    note: "For extended evaluation across market cycles.",
  },
  {
    id: "one-year",
    name: "1 Year",
    durationLabel: "1 Year",
    originalPriceUsd: 1999,
    priceUsd: 999,
    note: "For long-term access and ongoing workflow use.",
  },
] as const;

export type AgentSubscriptionPlan = (typeof agentSubscriptionPlans)[number];
export type AgentSubscriptionPlanId = AgentSubscriptionPlan["id"];

export function isSubscriptionAgentSlug(
  slug: string,
): slug is SubscriptionAgentSlug {
  return subscriptionAgentSlugs.includes(slug as SubscriptionAgentSlug);
}

export function getAgentSubscriptionPlan(planId: string) {
  return agentSubscriptionPlans.find((plan) => plan.id === planId) ?? null;
}

export function getSubscriptionAgentPlan(slug: string, planId: string) {
  if (!isSubscriptionAgentSlug(slug)) {
    return null;
  }

  return getAgentSubscriptionPlan(planId);
}
