import {
  appConfig,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";

export async function POST() {
  if (!appConfig.productAccessEnabled || !isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
