import Razorpay from "razorpay";
import { experts } from "@/data/experts";
import { products } from "@/data/products";
import { getSubscriptionAgentPlan } from "@/data/agent-subscription-plans";
import { validateCoupon } from "@/lib/coupon-validation";
import { getUsdToInrRate } from "@/lib/exchange-rate";
import { formatIstDateTime } from "@/lib/time";
import {
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { hashClientIp, saveRazorpayOrder } from "@/lib/server/persistence";

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

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function toRawRecord(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
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
    targetType === "product" && product && selectedPlanId
      ? getSubscriptionAgentPlan(product.slug, selectedPlanId)
      : null;

  if (selectedPlanId) {
    if (
      targetType !== "product" ||
      !product ||
      !selectedPlan
    ) {
      return Response.json(
        { message: "Invalid subscription plan selected." },
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
  const orderCreatedAtUtc = new Date().toISOString();
  const orderCreatedAtIstDisplay = formatIstDateTime(orderCreatedAtUtc) ?? "";
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

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const orderNotes = {
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
                  serviceType: "AI Trading Software Agent",
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
      usdToInrRateFetchedAt: usdToInrRateMetadata.fetchedAtUtc,
      usdToInrEffectiveDateIst: usdToInrRateMetadata.effectiveDateIst,
      usdAmount: finalPriceUsd.toFixed(2),
      inrAmountPaise: amountPaise.toString(),
      usdInrRate: usdToInrRate.toString(),
      exchangeRateSource: usdToInrRateMetadata.source,
      exchangeRateFetchedAtUtc: usdToInrRateMetadata.fetchedAtUtc,
      exchangeRateFetchedAtIstDisplay: usdToInrRateMetadata.fetchedAtIstDisplay,
      exchangeRateIsFallback: usdToInrRateMetadata.isFallback.toString(),
      orderCreatedAtUtc,
      orderCreatedAtIstDisplay,
      finalPriceInr: finalPriceInr.toFixed(2),
      ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
    };
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: buildReceipt(purchaseId),
      notes: orderNotes,
    });

    await saveRazorpayOrder({
      razorpayOrderId: order.id,
      targetType,
      orderCreatedAt: orderCreatedAtUtc,
      orderCreatedAtIstDisplay,
      customerName,
      customerEmail,
      productId: product?.id,
      productSlug: product?.slug,
      productName: product?.name,
      expertId: expert?.id,
      expertSlug: expert?.slug,
      expertName: expert?.fullName,
      sessionId: session?.id,
      sessionLabel: session?.label,
      sessionDurationMinutes: session?.durationMinutes,
      slotStartUtc,
      appointmentDate,
      appointmentSlot,
      selectedPlanId: selectedPlan?.id,
      selectedPlanName: selectedPlan?.name,
      subscriptionDuration: selectedPlan?.durationLabel,
      originalPriceUsd,
      discountUsd,
      finalPriceUsd,
      couponCode: appliedCoupon,
      usdToInrRate,
      usdToInrRateSource: usdToInrRateMetadata.source,
      exchangeRateFetchedAtUtc: usdToInrRateMetadata.fetchedAtUtc,
      exchangeRateFetchedAtIstDisplay: usdToInrRateMetadata.fetchedAtIstDisplay,
      exchangeRateIsFallback: usdToInrRateMetadata.isFallback,
      usdToInrEffectiveDateIst: usdToInrRateMetadata.effectiveDateIst,
      finalPriceInr,
      amountPaise,
      currency: "INR",
      clientIpHash: hashClientIp(getClientIp(request)),
      userAgent: request.headers.get("user-agent") ?? "",
      rawNotes: orderNotes,
      rawOrder: toRawRecord(order),
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
      usdToInrRateFetchedAt: usdToInrRateMetadata.fetchedAtUtc,
      usdToInrEffectiveDateIst: usdToInrRateMetadata.effectiveDateIst,
      usdAmount: finalPriceUsd,
      inrAmountPaise: amountPaise,
      usdInrRate: usdToInrRate,
      exchangeRateSource: usdToInrRateMetadata.source,
      exchangeRateFetchedAtUtc: usdToInrRateMetadata.fetchedAtUtc,
      exchangeRateFetchedAtIstDisplay:
        usdToInrRateMetadata.fetchedAtIstDisplay,
      exchangeRateIsFallback: usdToInrRateMetadata.isFallback,
      orderCreatedAtUtc,
      orderCreatedAtIstDisplay,
      slotStartUtc,
      ...(appliedCoupon ? { couponCode: appliedCoupon, appliedCoupon } : {}),
    });
  } catch {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }
}
