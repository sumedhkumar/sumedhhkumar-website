import crypto from "crypto";
import Razorpay from "razorpay";
import { experts } from "@/data/experts";
import { products } from "@/data/products";
import { sendRazorpayPaymentSuccessEmails } from "@/lib/email";
import type { RazorpayPaymentSuccessEmailInput } from "@/lib/email";
import {
  CalComAppError,
  createExpertBooking,
  formatIstTimeLabel,
} from "@/lib/server/calcom";
import { formatIstDateTime } from "@/lib/time";
import {
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import {
  hashRazorpaySignature,
  type StoredRazorpayPayment,
  updateRazorpayPaymentBookingStatus,
  updateRazorpayPaymentEmailStatus,
  upsertRazorpayVerifiedPayment,
} from "@/lib/server/persistence";

export const runtime = "nodejs";

type VerifyResponse = {
  success: true;
  purchaseType: "product" | "expert";
  orderId: string;
  paymentId: string;
  bookingConfirmed?: boolean;
  calBookingUid?: string;
  supportFollowupRequired?: boolean;
  paymentVerifiedAtUtc?: string;
  paymentVerifiedAtIstDisplay?: string;
  message?: string;
};

type RazorpayOrderWithNotes = {
  id: string;
  notes?: Record<string, unknown>;
};

type RazorpayPaymentDetails = {
  id: string;
  contact?: string | null;
  email?: string | null;
  captured_at?: number | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNote(notes: Record<string, unknown>, key: string) {
  const value = notes[key];
  return typeof value === "string" ? value.trim() : "";
}

function signaturesMatch(expectedSignature: string, providedSignature: string) {
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const providedBuffer = Buffer.from(providedSignature, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

function formatUsdFromNote(value: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return value || "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function formatInrFromNote(value: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return value || "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function formatRateFromNote(value: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return value || "₹0.0000";
  }

  return `₹${numberValue.toFixed(4)}`;
}

function formatSlotDisplay(slotStartUtc: string) {
  const date = new Date(slotStartUtc);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);

  return `${dateLabel}, ${formatIstTimeLabel(date)} IST`;
}

function toRawRecord(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function responseFromStoredPayment(payment: StoredRazorpayPayment): VerifyResponse {
  if (payment.purchaseType === "product") {
    return {
      success: true,
      purchaseType: "product",
      orderId: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId,
      paymentVerifiedAtUtc: payment.verifiedAt,
      paymentVerifiedAtIstDisplay: payment.verifiedAtIstDisplay ?? undefined,
    };
  }

  if (payment.bookingStatus === "confirmed") {
    return {
      success: true,
      purchaseType: "expert",
      orderId: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId,
      bookingConfirmed: true,
      calBookingUid: payment.calBookingUid ?? undefined,
      paymentVerifiedAtUtc: payment.verifiedAt,
      paymentVerifiedAtIstDisplay: payment.verifiedAtIstDisplay ?? undefined,
      message: "Booking confirmed. Please check your email for meeting details.",
    };
  }

  return {
    success: true,
    purchaseType: "expert",
    orderId: payment.razorpayOrderId,
    paymentId: payment.razorpayPaymentId,
    bookingConfirmed: false,
    supportFollowupRequired: true,
    paymentVerifiedAtUtc: payment.verifiedAt,
    paymentVerifiedAtIstDisplay: payment.verifiedAtIstDisplay ?? undefined,
    message:
      "Payment confirmed. Vyntegra will confirm the consultation slot or share next steps by email.",
  };
}

function buildEmailInput({
  notes,
  orderId,
  paymentId,
  purchaseType,
  purchaseName,
  purchaseDescription,
  slotDisplayIst,
  calBookingUid,
  calBookingStatus,
  calMeetingUrl,
  supportFollowupRequired,
  bookingErrorSummary,
  customerPhone,
  timestamp,
  paymentVerifiedAtUtc,
  paymentVerifiedAtIstDisplay,
  razorpayCapturedAtUtc,
  razorpayCapturedAtIstDisplay,
}: {
  notes: Record<string, unknown>;
  orderId: string;
  paymentId: string;
  purchaseType: "product" | "expert";
  purchaseName: string;
  purchaseDescription: string;
  slotDisplayIst?: string;
  calBookingUid?: string;
  calBookingStatus?: string;
  calMeetingUrl?: string;
  supportFollowupRequired?: boolean;
  bookingErrorSummary?: string;
  customerPhone?: string;
  timestamp: string;
  paymentVerifiedAtUtc: string;
  paymentVerifiedAtIstDisplay: string;
  razorpayCapturedAtUtc?: string;
  razorpayCapturedAtIstDisplay?: string;
}) {
  const exchangeRateFetchedAtUtc =
    readNote(notes, "exchangeRateFetchedAtUtc") ||
    readNote(notes, "usdToInrRateFetchedAt");
  const exchangeRateFetchedAtIstDisplay =
    readNote(notes, "exchangeRateFetchedAtIstDisplay") ||
    formatIstDateTime(exchangeRateFetchedAtUtc) ||
    "";
  const orderCreatedAtUtc = readNote(notes, "orderCreatedAtUtc");
  const orderCreatedAtIstDisplay =
    readNote(notes, "orderCreatedAtIstDisplay") ||
    formatIstDateTime(orderCreatedAtUtc) ||
    "";

  return {
    timestamp,
    purchaseType,
    customerName: readNote(notes, "customerName"),
    customerEmail: readNote(notes, "customerEmail"),
    customerPhone: customerPhone || readNote(notes, "customerPhone"),
    purchaseName,
    purchaseDescription,
    originalPriceUsd: formatUsdFromNote(readNote(notes, "originalPriceUsd")),
    couponCode: readNote(notes, "couponCode"),
    discountUsd: formatUsdFromNote(readNote(notes, "discountUsd")),
    finalPriceUsd: formatUsdFromNote(readNote(notes, "finalPriceUsd")),
    usdToInrRate: formatRateFromNote(readNote(notes, "usdToInrRate")),
    usdToInrRateSource: readNote(notes, "usdToInrRateSource"),
    usdToInrRateFetchedAt: exchangeRateFetchedAtIstDisplay,
    exchangeRateFetchedAtUtc,
    exchangeRateFetchedAtIstDisplay,
    exchangeRateIsFallback: readNote(notes, "exchangeRateIsFallback") === "true",
    orderCreatedAtUtc,
    orderCreatedAtIstDisplay,
    paymentVerifiedAtUtc,
    paymentVerifiedAtIstDisplay,
    razorpayCapturedAtUtc,
    razorpayCapturedAtIstDisplay,
    usdToInrEffectiveDateIst: readNote(notes, "usdToInrEffectiveDateIst"),
    finalPriceInr: formatInrFromNote(readNote(notes, "finalPriceInr")),
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    selectedPlanName: readNote(notes, "planName"),
    subscriptionDuration: readNote(notes, "subscriptionDuration"),
    payablePriceUsd: formatUsdFromNote(readNote(notes, "payablePriceUsd")),
    expertName: readNote(notes, "expertName"),
    sessionLabel: readNote(notes, "sessionLabel"),
    sessionDurationMinutes: readNote(notes, "sessionDurationMinutes"),
    slotStartUtc: readNote(notes, "slotStartUtc"),
    slotDisplayIst,
    calBookingUid,
    calBookingStatus,
    calMeetingUrl,
    supportFollowupRequired,
    bookingErrorSummary,
  };
}

function summarizeError(error: unknown) {
  if (error instanceof CalComAppError || error instanceof Error) {
    return error.message;
  }

  return "Unknown booking error.";
}

async function trySendRazorpayPaymentSuccessEmails(
  input: RazorpayPaymentSuccessEmailInput,
) {
  try {
    await sendRazorpayPaymentSuccessEmails(input);
    return { sent: true as const };
  } catch {
    console.error("Failed to send Razorpay success emails.");
    return { sent: false as const, error: "Email delivery failed." };
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      razorpay_order_id?: unknown;
      razorpay_payment_id?: unknown;
      razorpay_signature?: unknown;
    };
    const orderId = readString(body.razorpay_order_id);
    const paymentId = readString(body.razorpay_payment_id);
    const signature = readString(body.razorpay_signature);
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!orderId || !paymentId || !signature) {
      return Response.json(
        { message: "Payment verification details are required." },
        { status: 400 },
      );
    }

    if (!isProductionPersistenceConfigured()) {
      return serviceUnavailableResponse();
    }

    if (!keyId || !keySecret) {
      return Response.json(
        { message: "Unable to verify payment." },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, signature)) {
      return Response.json(
        { message: "Payment verification failed." },
        { status: 400 },
      );
    }

    const paymentVerifiedAtUtc = new Date().toISOString();
    const paymentVerifiedAtIstDisplay =
      formatIstDateTime(paymentVerifiedAtUtc) ?? "";

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const order = (await razorpay.orders.fetch(orderId)) as RazorpayOrderWithNotes;
    const payment = (await razorpay.payments.fetch(
      paymentId,
    )) as RazorpayPaymentDetails;
    const notes = order.notes ?? {};
    const razorpayCustomerPhone = readString(payment.contact);
    const razorpayCapturedAtUtc =
      typeof payment.captured_at === "number" && payment.captured_at > 0
        ? new Date(payment.captured_at * 1000).toISOString()
        : "";
    const razorpayCapturedAtIstDisplay =
      formatIstDateTime(razorpayCapturedAtUtc) ?? "";
    const targetType = readNote(notes, "targetType") === "expert" ? "expert" : "product";
    const stored = await upsertRazorpayVerifiedPayment({
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      purchaseType: targetType,
      verifiedAt: paymentVerifiedAtUtc,
      verifiedAtIstDisplay: paymentVerifiedAtIstDisplay,
      capturedAtUtc: razorpayCapturedAtUtc,
      capturedAtIstDisplay: razorpayCapturedAtIstDisplay,
      customerPhone: razorpayCustomerPhone,
      bookingStatus: targetType === "product" ? "not_applicable" : "pending",
      razorpaySignatureHash: hashRazorpaySignature(signature),
      rawPayment: toRawRecord(payment),
      rawVerificationPayload: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
      },
    });

    if (stored.payment.razorpayOrderId !== orderId) {
      return Response.json(
        { message: "Payment verification failed." },
        { status: 400 },
      );
    }

    if (!stored.created) {
      return Response.json(responseFromStoredPayment(stored.payment));
    }

    if (targetType === "product") {
      const productId = readNote(notes, "productId");
      const slug = readNote(notes, "slug");
      const product = products.find(
        (item) => item.id === productId || item.slug === slug,
      );

      if (!product || !product.active) {
        return Response.json(
          { message: "Paid product could not be matched." },
          { status: 400 },
        );
      }

      const emailResult = await trySendRazorpayPaymentSuccessEmails(
        buildEmailInput({
          notes,
          orderId,
          paymentId,
          purchaseType: "product",
          purchaseName: product.name,
          purchaseDescription: readNote(notes, "planId")
            ? `${product.name} subscription access. After payment verification, Vyntegra will send access/setup next steps by email.`
            : product.fullDescription || product.shortDescription,
          customerPhone: razorpayCustomerPhone,
          timestamp: paymentVerifiedAtUtc,
          paymentVerifiedAtUtc,
          paymentVerifiedAtIstDisplay,
          razorpayCapturedAtUtc: razorpayCapturedAtUtc || undefined,
          razorpayCapturedAtIstDisplay:
            razorpayCapturedAtIstDisplay || undefined,
        }),
      );
      await updateRazorpayPaymentEmailStatus(
        paymentId,
        emailResult.sent ? "sent" : "failed",
        emailResult.sent ? undefined : emailResult.error,
      );

      const response: VerifyResponse = {
        success: true,
        purchaseType: "product",
        orderId,
        paymentId,
        paymentVerifiedAtUtc,
        paymentVerifiedAtIstDisplay,
      };
      return Response.json(response);
    }

    const expertId = readNote(notes, "expertId");
    const sessionId = readNote(notes, "sessionId");
    const slotStartUtc = readNote(notes, "slotStartUtc");
    const expert = experts.find((item) => item.id === expertId && item.active);
    const session = expert?.sessions.find(
      (item) => item.id === sessionId && item.active && item.durationMinutes === 30,
    );

    if (!expert || !session || !slotStartUtc) {
      return Response.json(
        { message: "Paid consultation could not be matched." },
        { status: 400 },
      );
    }

    const purchaseName = `${expert.fullName} - ${session.label}`;
    const purchaseDescription = `${session.label}, ${session.durationMinutes} minutes with ${expert.fullName}.`;
    const slotDisplayIst = formatSlotDisplay(slotStartUtc);
    try {
      const booking = await createExpertBooking({
        expertId: expert.id,
        slotStartUtc,
        customerName: readNote(notes, "customerName"),
        customerEmail: readNote(notes, "customerEmail"),
        customerPhone: razorpayCustomerPhone,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        purchaseName,
      });
      const calBookingUid = booking.uid || String(booking.id ?? "");

      if (!calBookingUid) {
        throw new Error("Cal.com booking was created without a booking UID.");
      }

      const calMeetingUrl = booking.meetingUrl || booking.location;
      await updateRazorpayPaymentBookingStatus(paymentId, {
        bookingStatus: "confirmed",
        calBookingUid,
        calBookingStatus: booking.status,
        calMeetingUrl,
      });

      const emailResult = await trySendRazorpayPaymentSuccessEmails(
        buildEmailInput({
          notes,
          orderId,
          paymentId,
          purchaseType: "expert",
          purchaseName,
          purchaseDescription,
          slotDisplayIst,
          calBookingUid,
          calBookingStatus: booking.status,
          calMeetingUrl,
          customerPhone: razorpayCustomerPhone,
          timestamp: paymentVerifiedAtUtc,
          paymentVerifiedAtUtc,
          paymentVerifiedAtIstDisplay,
          razorpayCapturedAtUtc: razorpayCapturedAtUtc || undefined,
          razorpayCapturedAtIstDisplay:
            razorpayCapturedAtIstDisplay || undefined,
        }),
      );
      await updateRazorpayPaymentEmailStatus(
        paymentId,
        emailResult.sent ? "sent" : "failed",
        emailResult.sent ? undefined : emailResult.error,
      );

      const response: VerifyResponse = {
        success: true,
        purchaseType: "expert",
        orderId,
        paymentId,
        bookingConfirmed: true,
        calBookingUid,
        paymentVerifiedAtUtc,
        paymentVerifiedAtIstDisplay,
        message: "Booking confirmed. Please check your email for meeting details.",
      };
      return Response.json(response);
    } catch (bookingError) {
      const bookingErrorSummary = summarizeError(bookingError);

      await updateRazorpayPaymentBookingStatus(paymentId, {
        bookingStatus: "manual_followup_required",
        supportFollowupRequired: true,
        bookingErrorSummary,
      });

      const emailResult = await trySendRazorpayPaymentSuccessEmails(
        buildEmailInput({
          notes,
          orderId,
          paymentId,
          purchaseType: "expert",
          purchaseName,
          purchaseDescription,
          slotDisplayIst,
          supportFollowupRequired: true,
          bookingErrorSummary:
            `Expert payment verified but Cal.com booking failed/requires manual follow-up.\n${bookingErrorSummary}`,
          customerPhone: razorpayCustomerPhone,
          timestamp: paymentVerifiedAtUtc,
          paymentVerifiedAtUtc,
          paymentVerifiedAtIstDisplay,
          razorpayCapturedAtUtc: razorpayCapturedAtUtc || undefined,
          razorpayCapturedAtIstDisplay:
            razorpayCapturedAtIstDisplay || undefined,
        }),
      );
      await updateRazorpayPaymentEmailStatus(
        paymentId,
        emailResult.sent ? "sent" : "failed",
        emailResult.sent ? undefined : emailResult.error,
      );

      const response: VerifyResponse = {
        success: true,
        purchaseType: "expert",
        orderId,
        paymentId,
        bookingConfirmed: false,
        supportFollowupRequired: true,
        paymentVerifiedAtUtc,
        paymentVerifiedAtIstDisplay,
        message:
          "Payment confirmed. Vyntegra will confirm the consultation slot or share next steps by email.",
      };
      return Response.json(response);
    }
  } catch {
    return Response.json(
      { message: "Unable to verify payment." },
      { status: 500 },
    );
  }
}
