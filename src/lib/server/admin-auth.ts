import "server-only";

import { timingSafeEqual } from "node:crypto";
import { appConfig } from "@/lib/config";

function readAdminToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return bearerToken || request.headers.get("x-admin-token")?.trim() || "";
}

export function hasValidAdminToken(request: Request) {
  const expected = appConfig.adminExportToken;
  const provided = readAdminToken(request);

  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}
