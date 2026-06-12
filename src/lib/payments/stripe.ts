import Stripe from "stripe";
import { appConfig, hasStripeConfiguration } from "@/lib/config";

export function canUseStripePayments() {
  return hasStripeConfiguration();
}

export function getStripeClient() {
  if (!appConfig.stripeSecretKey) {
    throw new Error("Stripe secret key is missing.");
  }

  return new Stripe(appConfig.stripeSecretKey);
}

export async function constructStripeWebhookEvent({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  if (!canUseStripePayments() || !signature) {
    throw new Error("Stripe webhook configuration is missing.");
  }

  return getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    appConfig.stripeWebhookSecret,
  );
}
