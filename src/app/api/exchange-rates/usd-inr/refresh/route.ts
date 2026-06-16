import { forceRefreshUsdToInrRate } from "@/lib/exchange-rate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    const result = await forceRefreshUsdToInrRate();
    return Response.json({
      success: true,
      rate: result.rate,
      source: result.source,
      fetchedAt: result.fetchedAt,
      effectiveDateIst: result.effectiveDateIst,
    });
  } catch {
    return Response.json(
      { success: false, message: "Failed to refresh exchange rate" },
      { status: 500 }
    );
  }
}
