const expertCalendlyUrlMap: Record<string, string> = {};

export function getExpertCalendlyUrl(expertId: string) {
  return expertCalendlyUrlMap[expertId] ?? "";
}

export function hasExpertCalendlyUrl(expertId: string) {
  return Boolean(getExpertCalendlyUrl(expertId));
}
