import crypto from "crypto";
import { experts } from "@/data/experts";
import { products } from "@/data/products";

export const runtime = "nodejs";

function readString(value: unknown) {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      targetType?: unknown;
      razorpay_order_id?: unknown;
      razorpay_payment_id?: unknown;
      razorpay_signature?: unknown;
      productId?: unknown;
      expertId?: unknown;
      sessionId?: unknown;
      appointmentDate?: unknown;
      appointmentSlot?: unknown;
      slug?: unknown;
      customerName?: unknown;
      customerEmail?: unknown;
      customerPhone?: unknown;
      couponCode?: unknown;
    };
    const orderId = readString(body.razorpay_order_id);
    const paymentId = readString(body.razorpay_payment_id);
    const signature = readString(body.razorpay_signature);
    const targetType = readString(body.targetType) === "expert" ? "expert" : "product";
    const productIdentifier = readString(body.productId || body.slug);
    const expertIdentifier = readString(body.expertId || body.slug);
    const sessionId = readString(body.sessionId);
    const appointmentDate = readString(body.appointmentDate);
    const appointmentSlot = readString(body.appointmentSlot);
    const customerName = readString(body.customerName);
    const customerEmail = readString(body.customerEmail);
    const customerPhone = readString(body.customerPhone);
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
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
    const validTarget =
      targetType === "expert"
        ? Boolean(expert && expert.active && session && appointmentDate && appointmentSlot)
        : Boolean(product && product.active);

    if (
      !orderId ||
      !paymentId ||
      !signature ||
      !validTarget ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return Response.json(
        { message: "Payment verification details are required." },
        { status: 400 },
      );
    }

    if (!keySecret) {
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

    // TODO: Persist the paid order and send product access / booking email after storage exists.
    return Response.json({
      success: true,
      orderId,
      paymentId,
    });
  } catch {
    return Response.json(
      { message: "Unable to verify payment." },
      { status: 500 },
    );
  }
}
