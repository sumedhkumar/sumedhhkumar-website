import {
  appConfig,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { getExpertCalendlyUrl } from "@/lib/server/expert-booking";

export async function POST(request: Request) {
  if (!appConfig.expertBookingEnabled || !isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  const body = (await request.json()) as { expertId?: string };
  const url = getExpertCalendlyUrl(body.expertId ?? "");

  if (!url) {
    return serviceUnavailableResponse();
  }

  return serviceUnavailableResponse();
}
