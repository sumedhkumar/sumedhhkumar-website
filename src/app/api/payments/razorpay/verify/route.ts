import { hasRazorpayConfiguration, serviceUnavailableResponse } from "@/lib/config";

export async function POST() {
  if (!hasRazorpayConfiguration()) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
