import crypto from "crypto";
import Razorpay from "razorpay";
import { appConfig, hasRazorpayConfiguration } from "@/lib/config";

export function canUseRazorpayPayments() {
  return hasRazorpayConfiguration();
}

export function getRazorpayClient() {
  if (!appConfig.razorpayKeyId || !appConfig.razorpayKeySecret) {
    throw new Error("Razorpay credentials are missing.");
  }

  return new Razorpay({
    key_id: appConfig.razorpayKeyId,
    key_secret: appConfig.razorpayKeySecret,
  });
}

export function verifyRazorpayCheckoutSignature({
  storedOrderId,
  paymentId,
  signature,
}: {
  storedOrderId: string;
  paymentId: string;
  signature: string;
}) {
  const expectedSignature = crypto
    .createHmac("sha256", appConfig.razorpayKeySecret)
    .update(`${storedOrderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );
}

export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string | null;
}) {
  if (!signature || !appConfig.razorpayWebhookSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", appConfig.razorpayWebhookSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );
}
