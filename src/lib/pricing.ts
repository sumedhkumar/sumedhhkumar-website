import {
  isSubscriptionAgentSlug,
  type SubscriptionAgentSlug,
  type AgentSubscriptionPlanId,
} from "@/data/agent-subscription-plans";

export const EARLYACCESS_DISCOUNT_PERCENT = 50;

export const REGULAR_PRICES: Record<SubscriptionAgentSlug, Record<AgentSubscriptionPlanId, number>> = {
  "apex-flux": {
    "pilot-license": 399,
    "pro-license": 799,
    "elite-license": 1299,
  },
  "sentinel-vyn": {
    "pilot-license": 499,
    "pro-license": 1099,
    "elite-license": 1799,
  },
  "astro-vyn-gold": {
    "pilot-license": 599,
    "pro-license": 1299,
    "elite-license": 1999,
  },
};

export const SPEARLYACCESS_PRICES: Record<SubscriptionAgentSlug, Record<AgentSubscriptionPlanId, number>> = {
  "apex-flux": {
    "pilot-license": 149,
    "pro-license": 299,
    "elite-license": 499,
  },
  "sentinel-vyn": {
    "pilot-license": 149,
    "pro-license": 349,
    "elite-license": 549,
  },
  "astro-vyn-gold": {
    "pilot-license": 199,
    "pro-license": 399,
    "elite-license": 599,
  },
};

export function isSpecialEarlyAccessEnabled(): boolean {
  const flag = process.env.SPEARLYACCESS_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no" || flag === "disabled") {
    return false;
  }
  return true;
}

export function isCouponEnabled(couponCode: string): boolean {
  const normalized = couponCode.trim().toUpperCase();
  if (normalized === "EARLYACCESS") return true;
  if (normalized === "SPEARLYACCESS") return isSpecialEarlyAccessEnabled();
  return false;
}

export type PricingResult = {
  ok: boolean;
  message?: string;
  originalPriceUsd: number;
  discountUsd: number;
  finalPriceUsd: number;
  appliedCoupon: string;
};

export function calculateFinalPrice(
  agentSlug: string,
  planId: string,
  couponCode: string
): PricingResult {
  if (!isSubscriptionAgentSlug(agentSlug)) {
    return { ok: false, message: "Invalid agent selected.", originalPriceUsd: 0, discountUsd: 0, finalPriceUsd: 0, appliedCoupon: "" };
  }

  const normalizedPlanId = planId as AgentSubscriptionPlanId;
  const originalPriceUsd = REGULAR_PRICES[agentSlug as SubscriptionAgentSlug]?.[normalizedPlanId];

  if (originalPriceUsd === undefined) {
    return { ok: false, message: "Invalid plan selected.", originalPriceUsd: 0, discountUsd: 0, finalPriceUsd: 0, appliedCoupon: "" };
  }

  const normalizedCoupon = couponCode.trim().toUpperCase();

  if (!normalizedCoupon) {
    return { ok: true, originalPriceUsd, discountUsd: 0, finalPriceUsd: originalPriceUsd, appliedCoupon: "" };
  }

  if (normalizedCoupon === "EARLYACCESS") {
    const discountUsd = originalPriceUsd * (EARLYACCESS_DISCOUNT_PERCENT / 100);
    const finalPriceUsd = originalPriceUsd - discountUsd;
    return { ok: true, originalPriceUsd, discountUsd, finalPriceUsd, appliedCoupon: "EARLYACCESS" };
  }

  if (normalizedCoupon === "SPEARLYACCESS") {
    if (!isSpecialEarlyAccessEnabled()) {
      return { ok: false, message: "Invalid or expired coupon code.", originalPriceUsd, discountUsd: 0, finalPriceUsd: originalPriceUsd, appliedCoupon: "" };
    }

    const finalPriceUsd = SPEARLYACCESS_PRICES[agentSlug as SubscriptionAgentSlug]?.[normalizedPlanId];
    if (finalPriceUsd === undefined) {
      return { ok: false, message: "Invalid plan for special coupon.", originalPriceUsd, discountUsd: 0, finalPriceUsd: originalPriceUsd, appliedCoupon: "" };
    }

    const discountUsd = originalPriceUsd - finalPriceUsd;
    return { ok: true, originalPriceUsd, discountUsd, finalPriceUsd, appliedCoupon: "SPEARLYACCESS" };
  }

  return { ok: false, message: "Invalid or expired coupon code.", originalPriceUsd, discountUsd: 0, finalPriceUsd: originalPriceUsd, appliedCoupon: "" };
}
