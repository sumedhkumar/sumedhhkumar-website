import { REGULAR_PRICES } from "@/lib/pricing";

export const subscriptionAgentSlugs = [
  "astro-vyn-gold",
  "sentinel-vyn",
  "apex-flux",
] as const;

export type SubscriptionAgentSlug = (typeof subscriptionAgentSlugs)[number];

export const baseAgentSubscriptionPlans = [
  {
    id: "pilot-license",
    name: "Pilot License",
    durationLabel: "2 Months",
    note: "For entry access and workflow evaluation before extended live use.",
  },
  {
    id: "pro-license",
    name: "Pro License",
    durationLabel: "6 Months",
    note: "For extended evaluation across market cycles. Recommended.",
  },
  {
    id: "elite-license",
    name: "Elite License",
    durationLabel: "12 Months",
    note: "For long-term access and ongoing workflow use. Best Value.",
  },
] as const;

export type AgentSubscriptionPlanId = (typeof baseAgentSubscriptionPlans)[number]["id"];

export type AgentSubscriptionPlan = {
  id: AgentSubscriptionPlanId;
  name: string;
  durationLabel: string;
  originalPriceUsd: number;
  priceUsd: number;
  note: string;
};

export function isSubscriptionAgentSlug(
  slug: string,
): slug is SubscriptionAgentSlug {
  return subscriptionAgentSlugs.includes(slug as SubscriptionAgentSlug);
}

export function getSubscriptionAgentPlan(slug: string, planId: string): AgentSubscriptionPlan | null {
  if (!isSubscriptionAgentSlug(slug)) {
    return null;
  }

  const basePlan = baseAgentSubscriptionPlans.find((plan) => plan.id === planId);
  if (!basePlan) {
    return null;
  }

  const price = REGULAR_PRICES[slug][basePlan.id as AgentSubscriptionPlanId];

  return {
    ...basePlan,
    originalPriceUsd: price,
    priceUsd: price, // By default priceUsd is the originalPriceUsd. The frontend will apply coupons.
  };
}

export function getAgentSubscriptionPlans(slug: string): AgentSubscriptionPlan[] {
  if (!isSubscriptionAgentSlug(slug)) return [];
  return baseAgentSubscriptionPlans.map(plan => getSubscriptionAgentPlan(slug, plan.id) as AgentSubscriptionPlan);
}
