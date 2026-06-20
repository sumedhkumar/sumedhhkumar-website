import { formatIstDateTime } from "@/lib/time";

export type ExchangeRateMetadata = {
  rate: number;
  source: "live" | "cache" | "env-fallback" | "hardcoded-fallback";
  fetchedAtUtc: string;
  fetchedAtIstDisplay: string;
  isFallback: boolean;
  effectiveDateIst: string;
  fetchedAt: string;
};

type CachedRate = {
  rate: number;
  fetchedAtUtc: string;
  effectiveDateIst: string;
};

const DEFAULT_FALLBACK_RATE = 85;
const PRIMARY_API_URL = "https://open.er-api.com/v6/latest/USD";
const fallbackSnapshotEstablishedAtUtc = new Date().toISOString();

// In-memory cache
let cachedRate: CachedRate | null = null;

function buildSnapshot({
  rate,
  source,
  fetchedAtUtc,
  effectiveDateIst,
}: {
  rate: number;
  source: ExchangeRateMetadata["source"];
  fetchedAtUtc: string;
  effectiveDateIst: string;
}): ExchangeRateMetadata {
  return {
    rate,
    source,
    fetchedAtUtc,
    fetchedAtIstDisplay: formatIstDateTime(fetchedAtUtc) ?? "",
    isFallback: source === "env-fallback" || source === "hardcoded-fallback",
    effectiveDateIst,
    fetchedAt: fetchedAtUtc,
  };
}

/**
 * Returns the current date in IST formatted as YYYY-MM-DD.
 * It shifts the date if it's before 5:30 AM IST.
 */
function getEffectiveDateIst(): string {
  const now = new Date();
  
  // Create an Intl.DateTimeFormat for IST
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {} as Record<string, string>);

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);

  // If before 5:30 AM, use the previous day's effective date
  // 5:30 AM IST is hour < 5 or (hour === 5 && minute < 30)
  const isBefore530AM = hour < 5 || (hour === 5 && minute < 30);

  const effectiveDate = new Date(year, month - 1, day);
  if (isBefore530AM) {
    effectiveDate.setDate(effectiveDate.getDate() - 1);
  }

  const effYear = effectiveDate.getFullYear();
  const effMonth = String(effectiveDate.getMonth() + 1).padStart(2, "0");
  const effDay = String(effectiveDate.getDate()).padStart(2, "0");

  return `${effYear}-${effMonth}-${effDay}`;
}

function getEnvFallbackRate(): number | null {
  const rawRate = process.env.RAZORPAY_USD_TO_INR_RATE;
  const parsedRate = Number(rawRate);
  if (Number.isFinite(parsedRate) && parsedRate > 0) {
    return parsedRate;
  }
  return null;
}

export async function forceRefreshUsdToInrRate(): Promise<ExchangeRateMetadata> {
  const effectiveDateIst = getEffectiveDateIst();
  
  try {
    const response = await fetch(PRIMARY_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as { result?: unknown; rates?: { INR?: unknown } };
    if (!data || data.result !== "success" || !data.rates || typeof data.rates.INR !== "number" || !Number.isFinite(data.rates.INR) || data.rates.INR <= 0) {
      throw new Error("Invalid payload from exchange rate API");
    }

    const rate = Number(data.rates.INR.toFixed(4));
    const fetchedAtUtc = new Date().toISOString();

    cachedRate = {
      rate,
      fetchedAtUtc,
      effectiveDateIst,
    };

    return buildSnapshot({
      rate,
      source: "live",
      fetchedAtUtc,
      effectiveDateIst,
    });
  } catch (error) {
    console.error("Failed to fetch live USD-INR rate:", error);
    
    // Fallback to cache
    if (cachedRate) {
      return buildSnapshot({
        rate: cachedRate.rate,
        source: "cache",
        fetchedAtUtc: cachedRate.fetchedAtUtc,
        effectiveDateIst: cachedRate.effectiveDateIst,
      });
    }

    // Fallback to Env
    const envRate = getEnvFallbackRate();
    if (envRate !== null) {
      return buildSnapshot({
        rate: envRate,
        source: "env-fallback",
        fetchedAtUtc: fallbackSnapshotEstablishedAtUtc,
        effectiveDateIst,
      });
    }

    // Hardcoded fallback
    return buildSnapshot({
      rate: DEFAULT_FALLBACK_RATE,
      source: "hardcoded-fallback",
      fetchedAtUtc: fallbackSnapshotEstablishedAtUtc,
      effectiveDateIst,
    });
  }
}

export async function getUsdToInrRate(): Promise<ExchangeRateMetadata> {
  // Always run server-side check
  if (typeof window !== "undefined") {
    throw new Error("getUsdToInrRate can only be run on the server side.");
  }

  const effectiveDateIst = getEffectiveDateIst();

  if (cachedRate && cachedRate.effectiveDateIst === effectiveDateIst) {
    return buildSnapshot({
      rate: cachedRate.rate,
      source: "cache",
      fetchedAtUtc: cachedRate.fetchedAtUtc,
      effectiveDateIst: cachedRate.effectiveDateIst,
    });
  }

  return forceRefreshUsdToInrRate();
}
