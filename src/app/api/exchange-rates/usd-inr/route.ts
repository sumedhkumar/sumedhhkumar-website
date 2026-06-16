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
      fetchedAt: result.fetchedAt,
      effectiveDateIst: result.effectiveDateIst,
    });
  } catch {
    return Response.json(
      { success: false, message: "Failed to get exchange rate" },
      { status: 500 }
    );
  }
}
