import { isProductionPersistenceConfigured, serviceUnavailableResponse } from "@/lib/config";
import { hasValidAdminToken } from "@/lib/server/admin-auth";
import {
  listRazorpayPayments,
  type PurchaseType,
} from "@/lib/server/persistence";

export const runtime = "nodejs";

function readLimit(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 200) : 50;
}

function readOffset(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function readDate(value: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return undefined;
  }

  return new Date(value).toISOString();
}

export async function GET(request: Request) {
  if (!hasValidAdminToken(request)) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  const { searchParams } = new URL(request.url);
  const purchaseTypeValue = searchParams.get("purchaseType");
  const purchaseType: PurchaseType | undefined =
    purchaseTypeValue === "product" || purchaseTypeValue === "expert"
      ? purchaseTypeValue
      : undefined;
  const payments = await listRazorpayPayments({
    purchaseType,
    limit: readLimit(searchParams.get("limit")),
    offset: readOffset(searchParams.get("offset")),
    email: searchParams.get("email")?.trim() || undefined,
    from: readDate(searchParams.get("from")),
    to: readDate(searchParams.get("to")),
  });

  return Response.json({ payments });
}
