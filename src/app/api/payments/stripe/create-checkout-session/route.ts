import { hasStripeConfiguration, serviceUnavailableResponse } from "@/lib/config";

export async function POST() {
  if (!hasStripeConfiguration()) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
