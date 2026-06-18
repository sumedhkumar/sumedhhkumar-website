import Razorpay from "razorpay";
import { experts } from "@/data/experts";
import { products } from "@/data/products";
import { getAstroVynGoldPlan } from "@/data/astro-vyn-gold-plans";
import { validateCoupon } from "@/lib/coupon-validation";
import { getUsdToInrRate } from "@/lib/exchange-rate";
import { CalComAppError, reserveExpertSlot } from "@/lib/server/calcom";

export const runtime = "nodejs";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildReceipt(productId: string) {
  const normalizedProductId = productId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `vyn_${normalizedProductId}_${Date.now().toString(36)}`.slice(0, 40);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    targetType?: unknown;
    productId?: unknown;
    slug?: unknown;
    expertId?: unknown;
    sessionId?: unknown;
    appointmentDate?: unknown;
    appointmentSlot?: unknown;
    slotStartUtc?: unknown;
    customerName?: unknown;
    customerEmail?: unknown;
    couponCode?: unknown;
    selectedPlanId?: unknown;
  };
  const targetType = readString(body.targetType) === "expert" ? "expert" : "product";
  const productIdentifier = readString(body.productId || body.slug);
  const expertIdentifier = readString(body.expertId || body.slug);
  const sessionId = readString(body.sessionId);
  const appointmentDate = readString(body.appointmentDate);
  const appointmentSlot = readString(body.appointmentSlot);
  const slotStartUtc = readString(body.slotStartUtc);
  const customerName = readString(body.customerName);
  const customerEmail = readString(body.customerEmail);
  const couponCode = readString(body.couponCode);
  const selectedPlanId = readString(body.selectedPlanId);

  if (
    !customerName ||
    !customerEmail ||
    !isValidEmail(customerEmail)
  ) {
    return Response.json(
      { message: "Customer name and valid email are required." },
      { status: 400 },
    );
  }

  const product =
    targetType === "product"
      ? products.find(
          (item) =>
            item.id === productIdentifier ||
            item.slug === productIdentifier ||
            item.slug === readString(body.slug),
        )
      : null;
  const expert =
    targetType === "expert"
      ? experts.find(
          (item) =>
            item.id === expertIdentifier ||
            item.slug === expertIdentifier ||
            item.slug === readString(body.slug),
        )
      : null;
  const session =
    targetType === "expert"
      ? expert?.sessions.find((item) => item.id === sessionId && item.active)
      : null;

  if (targetType === "product" && (!product || !product.active)) {
    return Response.json(
      { message: "Invalid product selected." },
      { status: 400 },
    );
  }

  const selectedPlan =
    targetType === "product" && selectedPlanId
      ? getAstroVynGoldPlan(selectedPlanId)
      : null;

  if (selectedPlanId) {
    if (
      targetType !== "product" ||
      !product ||
      product.slug !== "astro-vyn-gold" ||
      !selectedPlan
    ) {
      return Response.json(
        { message: "Invalid Astro-Vyn Gold subscription plan selected." },
        { status: 400 },
      );
    }

    if (couponCode) {
      return Response.json(
        { message: "Coupons are not available for this subscription checkout." },
        { status: 400 },
      );
    }
  }

  if (
    targetType === "expert" &&
    (!expert || !expert.active || !session || session.durationMinutes !== 30)
  ) {
    return Response.json(
      { message: "Invalid consultation selected." },
      { status: 400 },
    );
  }

  if (targetType === "expert") {
    const slotStart = new Date(slotStartUtc);

    if (
      !slotStartUtc ||
      Number.isNaN(slotStart.getTime()) ||
      slotStart.getTime() <= Date.now()
    ) {
      return Response.json(
        { message: "Select a valid future consultation slot." },
        { status: 400 },
      );
    }
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const usdToInrRateMetadata = await getUsdToInrRate();
  const usdToInrRate = usdToInrRateMetadata.rate;

  if (!keyId || !keySecret || !usdToInrRate) {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }

  const purchaseId = targetType === "expert" ? session?.id ?? "" : product?.id ?? "";
  const purchaseName =
    targetType === "expert"
      ? `${expert?.fullName ?? "Expert"} - ${session?.label ?? "Consultation"}`
      : selectedPlan
        ? `${product?.name ?? "Product"} - ${selectedPlan.name}`
        : product?.name ?? "Product";
  const originalPriceUsd =
    targetType === "expert"
      ? session?.feeUsd ?? 0
      : selectedPlan
        ? selectedPlan.originalPriceUsd
        : product?.priceUsd ?? 0;
  let discountUsd =
    selectedPlan && targetType === "product"
      ? selectedPlan.originalPriceUsd - selectedPlan.priceUsd
      : 0;
  let finalPriceUsd =
    selectedPlan && targetType === "product"
      ? selectedPlan.priceUsd
      : originalPriceUsd;
  let appliedCoupon = "";

  if (couponCode && !selectedPlan) {
    const couponResult = validateCoupon({
      code: couponCode,
      amountUsd: originalPriceUsd,
      target:
        targetType === "expert"
          ? {
              type: "expert",
              expertId: expert?.id ?? "",
              sessionId: session?.id ?? "",
            }
          : {
              type: "product",
              productId: product?.id ?? "",
            },
    });

    if (!couponResult.ok) {
      return Response.json(
        { message: couponResult.message },
        { status: 400 },
      );
    }

    discountUsd = couponResult.discountAmountUsd;
    finalPriceUsd = couponResult.finalAmountUsd;
    appliedCoupon = couponCode.toUpperCase();
  }

  const finalPriceInr = Number((finalPriceUsd * usdToInrRate).toFixed(2));
  const amountPaise = Math.round(finalPriceInr * 100);

  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }

  try {
    let calReservationUid = "";

    if (targetType === "expert" && expert) {
      try {
        calReservationUid = await reserveExpertSlot({
          expertId: expert.id,
          slotStartUtc,
        });
      } catch (error) {
        if (error instanceof CalComAppError) {
          return Response.json(
            {
              message:
                error.status === 409
                  ? "This slot is no longer available. Please select another slot."
                  : "Live booking availability could not be reserved. Please try another slot.",
            },
            { status: error.status === 409 ? 409 : 502 },
          );
        }

        return Response.json(
          { message: "This slot is no longer available. Please select another slot." },
          { status: 409 },
        );
      }
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: buildReceipt(purchaseId),
      notes: {
        targetType,
        ...(targetType === "expert"
          ? {
              expertId: expert?.id ?? "",
              expertSlug: expert?.slug ?? "",
              expertName: expert?.fullName ?? "",
              sessionId: session?.id ?? "",
              sessionLabel: session?.label ?? "",
              sessionDurationMinutes: "30",
              slotStartUtc,
              calReservationUid,
              appointmentDate,
              appointmentSlot,
            }
          : {
              productId: product?.id ?? "",
              slug: product?.slug ?? "",
              productSlug: product?.slug ?? "",
              productName: product?.name ?? "",
              ...(selectedPlan
                ? {
                    planId: selectedPlan.id,
                    planName: selectedPlan.name,
                    subscriptionDuration: selectedPlan.durationLabel,
                    originalPriceUsd: selectedPlan.originalPriceUsd.toFixed(2),
                    payablePriceUsd: selectedPlan.priceUsd.toFixed(2),
                  }
                : {}),
            }),
        purchaseName,
        customerName,
        customerEmail,
        originalPriceUsd: originalPriceUsd.toFixed(2),
        discountUsd: discountUsd.toFixed(2),
        finalPriceUsd: finalPriceUsd.toFixed(2),
        usdToInrRate: usdToInrRate.toString(),
        usdToInrRateSource: usdToInrRateMetadata.source,
        usdToInrRateFetchedAt: usdToInrRateMetadata.fetchedAt,
        usdToInrEffectiveDateIst: usdToInrRateMetadata.effectiveDateIst,
        finalPriceInr: finalPriceInr.toFixed(2),
        ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
      },
    });

    return Response.json({
      key: keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      productName: purchaseName,
      purchaseName,
      originalPriceUsd,
      discountUsd,
      finalPriceUsd,
      finalPriceInr,
      ...(selectedPlan
        ? {
            selectedPlanId: selectedPlan.id,
            selectedPlanName: selectedPlan.name,
            subscriptionDuration: selectedPlan.durationLabel,
            payablePriceUsd: selectedPlan.priceUsd,
          }
        : {}),
      usdToInrRate: usdToInrRate,
      usdToInrRateSource: usdToInrRateMetadata.source,
      usdToInrRateFetchedAt: usdToInrRateMetadata.fetchedAt,
      usdToInrEffectiveDateIst: usdToInrRateMetadata.effectiveDateIst,
      slotStartUtc,
      calReservationUid,
      ...(appliedCoupon ? { couponCode: appliedCoupon, appliedCoupon } : {}),
    });
  } catch {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }
}
