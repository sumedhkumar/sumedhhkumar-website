import {
  appConfig,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";

export async function POST() {
  if (!appConfig.expertBookingEnabled || !isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
