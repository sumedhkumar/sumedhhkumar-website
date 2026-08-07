/**
 * Returns the base URL for API calls.
 * - In development: uses local Next.js API routes (/api/...)
 * - In production (static build): uses Supabase Edge Functions
 */
export function getApiUrl(path: string): string {
  const supabaseFunctionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;

  // Strip leading /api/ to get function name, e.g. /api/contact -> contact
  const functionName = path.replace(/^\/api\//, "");

  if (supabaseFunctionsUrl) {
    return `${supabaseFunctionsUrl}/${functionName}`;
  }

  // Fallback to local API route (dev mode or if env var not set)
  return path;
}
