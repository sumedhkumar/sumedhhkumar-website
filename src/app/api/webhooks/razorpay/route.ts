import { hasRazorpayConfiguration, serviceUnavailableResponse } from "@/lib/config";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  if (!hasRazorpayConfiguration()) {
    return serviceUnavailableResponse();
  }

  const rawBody = await request.text();
  const valid = verifyRazorpayWebhookSignature({
    rawBody,
    signature: request.headers.get("x-razorpay-signature"),
  });

  if (!valid) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
