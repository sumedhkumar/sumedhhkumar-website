import { coupons } from "@/data/coupons";
import type {
  Coupon,
  CouponPurchaseTarget,
  CouponValidationResult,
} from "@/types";

const invalidMessage = "Coupon code is invalid or inactive.";
const expiredMessage = "Coupon code has expired.";
const usageLimitMessage = "Coupon usage limit has been reached.";
const notApplicableMessage = "Coupon code is not applicable to this purchase.";
const appliedMessage = "Coupon applied.";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function isStarted(coupon: Coupon, now: Date) {
  if (!coupon.validFrom) {
    return true;
  }

  return new Date(coupon.validFrom).getTime() <= now.getTime();
}

function isExpired(coupon: Coupon, now: Date) {
  if (!coupon.expiresAt) {
    return false;
  }

  return new Date(coupon.expiresAt).getTime() < now.getTime();
}

function isApplicable(coupon: Coupon, target: CouponPurchaseTarget) {
  if (target.type === "product") {
    return (
      coupon.applicableProductIds.length === 0 ||
      coupon.applicableProductIds.includes(target.productId)
    );
  }

  const expertApplies =
    coupon.applicableExpertIds.length === 0 ||
    coupon.applicableExpertIds.includes(target.expertId);
  const sessionApplies =
    coupon.applicableSessionIds.length === 0 ||
    coupon.applicableSessionIds.includes(target.sessionId);

  return expertApplies && sessionApplies;
}

function calculateDiscount(coupon: Coupon, amountUsd: number) {
  if (coupon.discountType === "percentage") {
    return Math.min(amountUsd, (amountUsd * coupon.discountValue) / 100);
  }

  return Math.min(amountUsd, coupon.discountValue);
}

export function validateCoupon({
  code,
  amountUsd,
  target,
}: {
  code: string;
  amountUsd: number;
  target: CouponPurchaseTarget;
}): CouponValidationResult {
  const normalizedCode = normalizeCode(code);
  const coupon = coupons.find(
    (item) => normalizeCode(item.code) === normalizedCode,
  );

  if (!coupon || !coupon.active || !isStarted(coupon, new Date())) {
    return {
      ok: false,
      message: invalidMessage,
      discountAmountUsd: 0,
      finalAmountUsd: amountUsd,
    };
  }

  if (isExpired(coupon, new Date())) {
    return {
      ok: false,
      message: expiredMessage,
      discountAmountUsd: 0,
      finalAmountUsd: amountUsd,
    };
  }

  if (
    coupon.totalUsageLimit !== null &&
    coupon.usageCount >= coupon.totalUsageLimit
  ) {
    return {
      ok: false,
      message: usageLimitMessage,
      discountAmountUsd: 0,
      finalAmountUsd: amountUsd,
    };
  }

  if (!isApplicable(coupon, target)) {
    return {
      ok: false,
      message: notApplicableMessage,
      discountAmountUsd: 0,
      finalAmountUsd: amountUsd,
    };
  }

  const discountAmountUsd = Number(calculateDiscount(coupon, amountUsd).toFixed(2));

  return {
    ok: true,
    message: appliedMessage,
    discountAmountUsd,
    finalAmountUsd: Number((amountUsd - discountAmountUsd).toFixed(2)),
  };
}
