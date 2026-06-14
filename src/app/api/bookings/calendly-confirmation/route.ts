import {
  appConfig,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { validateBookingAccessToken } from "@/lib/server/payment-tokens";

export async function POST(request: Request) {
  if (!appConfig.expertBookingEnabled || !isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  const body = (await request.json()) as {
    bookingAccessToken?: string;
    expertId?: string;
    payload?: unknown;
  };

  if (!body.expertId || !validateBookingAccessToken(body.bookingAccessToken ?? "")) {
    return Response.json(
      {
        ok: false,
        message: "Verified payment is required before confirming a booking.",
      },
      { status: 403 },
    );
  }

  void body.payload;

  return serviceUnavailableResponse();
}
