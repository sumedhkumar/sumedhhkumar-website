import Razorpay from "razorpay";
import { experts } from "@/data/experts";
import { products } from "@/data/products";
import { validateCoupon } from "@/lib/coupon-validation";
import { getUsdToInrRate } from "@/lib/exchange-rate";

export const runtime = "nodejs";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^[+]?[0-9]{7,15}$/.test(value);
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
    customerName?: unknown;
    customerEmail?: unknown;
    customerPhone?: unknown;
    couponCode?: unknown;
  };
  const targetType = readString(body.targetType) === "expert" ? "expert" : "product";
  const productIdentifier = readString(body.productId || body.slug);
  const expertIdentifier = readString(body.expertId || body.slug);
  const sessionId = readString(body.sessionId);
  const appointmentDate = readString(body.appointmentDate);
  const appointmentSlot = readString(body.appointmentSlot);
  const customerName = readString(body.customerName);
  const customerEmail = readString(body.customerEmail);
  const customerPhone = readString(body.customerPhone);
  const couponCode = readString(body.couponCode);

  if (
    !customerName ||
    !customerEmail ||
    !isValidEmail(customerEmail) ||
    !customerPhone ||
    !isValidPhone(customerPhone)
  ) {
    return Response.json(
      { message: "Customer name, valid email, and valid phone number are required." },
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

  if (
    targetType === "expert" &&
    (!expert || !expert.active || !session || !appointmentDate || !appointmentSlot)
  ) {
    return Response.json(
      { message: "Invalid consultation selected." },
      { status: 400 },
    );
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
      : product?.name ?? "Product";
  const originalPriceUsd =
    targetType === "expert" ? session?.feeUsd ?? 0 : product?.priceUsd ?? 0;
  let discountUsd = 0;
  let finalPriceUsd = originalPriceUsd;
  let appliedCoupon = "";

  if (couponCode) {
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
              appointmentDate,
              appointmentSlot,
            }
          : {
              productId: product?.id ?? "",
              slug: product?.slug ?? "",
              productName: product?.name ?? "",
            }),
        purchaseName,
        customerName,
        customerEmail,
        customerPhone,
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
      usdToInrRate: usdToInrRate,
      usdToInrRateSource: usdToInrRateMetadata.source,
      usdToInrEffectiveDateIst: usdToInrRateMetadata.effectiveDateIst,
      ...(appliedCoupon ? { couponCode: appliedCoupon, appliedCoupon } : {}),
    });
  } catch {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }
}
