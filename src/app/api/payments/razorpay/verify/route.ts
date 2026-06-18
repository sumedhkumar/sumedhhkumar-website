import crypto from "crypto";
import Razorpay from "razorpay";
import { experts } from "@/data/experts";
import { products } from "@/data/products";
import { sendRazorpayPaymentSuccessEmails } from "@/lib/email";
import type { RazorpayPaymentSuccessEmailInput } from "@/lib/email";
import {
  CalComAppError,
  createExpertBooking,
  createPrivateFallbackLink,
  formatIstTimeLabel,
} from "@/lib/server/calcom";

export const runtime = "nodejs";

type VerifyResponse = {
  success: true;
  purchaseType: "product" | "expert";
  orderId: string;
  paymentId: string;
  bookingConfirmed?: boolean;
  calBookingUid?: string;
  fallbackBookingLinkSent?: boolean;
  supportFollowupRequired?: boolean;
};

type RazorpayOrderWithNotes = {
  id: string;
  notes?: Record<string, unknown>;
};

type RazorpayPaymentDetails = {
  id: string;
  contact?: string | null;
  email?: string | null;
};

const verifyResults = new Map<string, VerifyResponse>();

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

function formatIstTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "Not provided";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })
    .format(date)
    .replace(",", "")
    .replace(/\s/g, " ");
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
  fallbackBookingUrl,
  supportFollowupRequired,
  bookingErrorSummary,
  customerPhone,
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
  fallbackBookingUrl?: string;
  supportFollowupRequired?: boolean;
  bookingErrorSummary?: string;
  customerPhone?: string;
}) {
  return {
    timestamp: new Date().toISOString(),
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
    usdToInrRateFetchedAt: formatIstTimestamp(
      readNote(notes, "usdToInrRateFetchedAt"),
    ),
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
    fallbackBookingUrl,
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
    return true;
  } catch (error) {
    console.error("Failed to send Razorpay success emails:", summarizeError(error));
    return false;
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
    const idempotencyKey = `${orderId}:${paymentId}`;

    if (!orderId || !paymentId || !signature) {
      return Response.json(
        { message: "Payment verification details are required." },
        { status: 400 },
      );
    }

    const cachedResult = verifyResults.get(idempotencyKey);
    if (cachedResult) {
      return Response.json(cachedResult);
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
    const targetType = readNote(notes, "targetType") === "expert" ? "expert" : "product";

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

      await trySendRazorpayPaymentSuccessEmails(
        buildEmailInput({
          notes,
          orderId,
          paymentId,
          purchaseType: "product",
          purchaseName: product.name,
          purchaseDescription: readNote(notes, "planId")
            ? "Astro-Vyn Gold subscription access. After payment verification, Vyntegra will send access/setup next steps by email."
            : product.fullDescription || product.shortDescription,
          customerPhone: razorpayCustomerPhone,
        }),
      );

      const response: VerifyResponse = {
        success: true,
        purchaseType: "product",
        orderId,
        paymentId,
      };
      verifyResults.set(idempotencyKey, response);
      return Response.json(response);
    }

    const expertId = readNote(notes, "expertId");
    const sessionId = readNote(notes, "sessionId");
    const slotStartUtc = readNote(notes, "slotStartUtc");
    const calReservationUid = readNote(notes, "calReservationUid");
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

    if (!razorpayCustomerPhone) {
      await trySendRazorpayPaymentSuccessEmails(
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
            "Razorpay did not return a customer contact number, so Vyntegra support must confirm the booking manually.",
        }),
      );

      const response: VerifyResponse = {
        success: true,
        purchaseType: "expert",
        orderId,
        paymentId,
        bookingConfirmed: false,
        supportFollowupRequired: true,
      };
      verifyResults.set(idempotencyKey, response);
      return Response.json(response);
    }

    try {
      const booking = await createExpertBooking({
        expertId: expert.id,
        slotStartUtc,
        calReservationUid,
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

      await trySendRazorpayPaymentSuccessEmails(
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
          calMeetingUrl: booking.meetingUrl || booking.location,
          customerPhone: razorpayCustomerPhone,
        }),
      );

      const response: VerifyResponse = {
        success: true,
        purchaseType: "expert",
        orderId,
        paymentId,
        bookingConfirmed: true,
        calBookingUid,
      };
      verifyResults.set(idempotencyKey, response);
      return Response.json(response);
    } catch (bookingError) {
      const bookingErrorSummary = summarizeError(bookingError);

      try {
        const fallbackBookingUrl = await createPrivateFallbackLink({
          expertId: expert.id,
        });

        await trySendRazorpayPaymentSuccessEmails(
          buildEmailInput({
            notes,
            orderId,
            paymentId,
            purchaseType: "expert",
            purchaseName,
            purchaseDescription,
            slotDisplayIst,
            fallbackBookingUrl,
            bookingErrorSummary,
            customerPhone: razorpayCustomerPhone,
          }),
        );

        const response: VerifyResponse = {
          success: true,
          purchaseType: "expert",
          orderId,
          paymentId,
          bookingConfirmed: false,
          fallbackBookingLinkSent: true,
        };
        verifyResults.set(idempotencyKey, response);
        return Response.json(response);
      } catch (fallbackError) {
        await trySendRazorpayPaymentSuccessEmails(
          buildEmailInput({
            notes,
            orderId,
            paymentId,
            purchaseType: "expert",
            purchaseName,
            purchaseDescription,
            slotDisplayIst,
            supportFollowupRequired: true,
            bookingErrorSummary: [
              `Booking: ${bookingErrorSummary}`,
              `Private link: ${summarizeError(fallbackError)}`,
            ].join("\n"),
            customerPhone: razorpayCustomerPhone,
          }),
        );

        const response: VerifyResponse = {
          success: true,
          purchaseType: "expert",
          orderId,
          paymentId,
          bookingConfirmed: false,
          supportFollowupRequired: true,
        };
        verifyResults.set(idempotencyKey, response);
        return Response.json(response);
      }
    }
  } catch {
    return Response.json(
      { message: "Unable to verify payment." },
      { status: 500 },
    );
  }
}
