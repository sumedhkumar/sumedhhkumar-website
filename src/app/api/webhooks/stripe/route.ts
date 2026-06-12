import { hasStripeConfiguration, serviceUnavailableResponse } from "@/lib/config";
import { constructStripeWebhookEvent } from "@/lib/payments/stripe";

export async function POST(request: Request) {
  if (!hasStripeConfiguration()) {
    return serviceUnavailableResponse();
  }

  try {
    const payload = await request.text();
    await constructStripeWebhookEvent({
      payload,
      signature: request.headers.get("stripe-signature"),
    });

    return serviceUnavailableResponse();
  } catch {
    return Response.json(
      { ok: false, message: "This service is not configured yet." },
      { status: 503 },
    );
  }
}
