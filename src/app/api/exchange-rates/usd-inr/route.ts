import { getUsdToInrRate } from "@/lib/exchange-rate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getUsdToInrRate();
    return Response.json({
      success: true,
      rate: result.rate,
      source: result.source,
      exchangeRateFetchedAtUtc: result.fetchedAtUtc,
      exchangeRateFetchedAtIstDisplay: result.fetchedAtIstDisplay,
      exchangeRateIsFallback: result.isFallback,
      effectiveDateIst: result.effectiveDateIst,
      fetchedAt: result.fetchedAtUtc,
    });
  } catch {
    return Response.json(
      { success: false, message: "Failed to get exchange rate" },
      { status: 500 }
    );
  }
}
