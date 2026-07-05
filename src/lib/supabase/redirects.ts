import { algoTradingCourse } from "@/data/algo-trading-course";

export const courseAuthSuccessFallbackPath = algoTradingCourse.accessRoute;
export const courseAuthErrorFallbackPath = `${algoTradingCourse.route}?auth=error`;

export function getSafeInternalRedirectPath(
  value: string | null,
  fallbackPath: string = courseAuthSuccessFallbackPath,
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(value, "https://vyntegra.local");

    if (parsed.origin !== "https://vyntegra.local") {
      return fallbackPath;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallbackPath;
  }
}
