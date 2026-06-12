import { hasCryptoConfiguration, serviceUnavailableResponse } from "@/lib/config";

export async function POST() {
  if (!hasCryptoConfiguration()) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
