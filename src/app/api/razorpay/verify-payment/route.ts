import crypto from "crypto";

export const runtime = "nodejs";

function readRequiredString(value: unknown) {
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
  const body = (await request.json().catch(() => ({}))) as {
    razorpay_order_id?: unknown;
    razorpay_payment_id?: unknown;
    razorpay_signature?: unknown;
    productId?: unknown;
    customerName?: unknown;
    customerEmail?: unknown;
  };
  const orderId = readRequiredString(body.razorpay_order_id);
  const paymentId = readRequiredString(body.razorpay_payment_id);
  const signature = readRequiredString(body.razorpay_signature);
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!orderId || !paymentId || !signature) {
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

  // TODO: Mark the order as paid after verification once payment persistence exists.
  return Response.json({
    success: true,
    orderId,
    paymentId,
  });
}
