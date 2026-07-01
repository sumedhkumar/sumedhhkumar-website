import {
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { hasValidAdminToken } from "@/lib/server/admin-auth";
import {
  listCourseRegistrations,
  type CourseAccessStatus,
  type CourseLoginProvider,
  type CoursePaymentStatus,
} from "@/lib/server/persistence";

export const runtime = "nodejs";

const accessStatuses = new Set<CourseAccessStatus>([
  "free_access",
  "paid",
  "blocked",
]);
const paymentStatuses = new Set<CoursePaymentStatus>([
  "unpaid",
  "paid",
  "manual_verification",
]);
const loginProviders = new Set<CourseLoginProvider>([
  "google",
  "email_password",
]);

function readLimit(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 200) : 50;
}

function readOffset(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function readEnumFilter<T extends string>(
  searchParams: URLSearchParams,
  name: string,
  allowedValues: Set<T>,
) {
  const value = searchParams.get(name)?.trim() ?? "";

  if (!value) {
    return { ok: true as const, value: undefined };
  }

  if (!allowedValues.has(value as T)) {
    return {
      ok: false as const,
      response: Response.json(
        {
          ok: false,
          message: `Invalid ${name} filter.`,
        },
        { status: 400 },
      ),
    };
  }

  return { ok: true as const, value: value as T };
}

export async function GET(request: Request) {
  if (!hasValidAdminToken(request)) {
    return Response.json(
      { ok: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  const { searchParams } = new URL(request.url);
  const accessStatus = readEnumFilter(
    searchParams,
    "accessStatus",
    accessStatuses,
  );
  const paymentStatus = readEnumFilter(
    searchParams,
    "paymentStatus",
    paymentStatuses,
  );
  const loginProvider = readEnumFilter(
    searchParams,
    "loginProvider",
    loginProviders,
  );

  if (!accessStatus.ok) {
    return accessStatus.response;
  }

  if (!paymentStatus.ok) {
    return paymentStatus.response;
  }

  if (!loginProvider.ok) {
    return loginProvider.response;
  }

  const limit = readLimit(searchParams.get("limit"));
  const offset = readOffset(searchParams.get("offset"));
  const result = await listCourseRegistrations({
    search: searchParams.get("search")?.trim() || undefined,
    accessStatus: accessStatus.value,
    paymentStatus: paymentStatus.value,
    loginProvider: loginProvider.value,
    courseSlug: searchParams.get("courseSlug")?.trim() || undefined,
    limit,
    offset,
  });

  return Response.json({
    ok: true,
    registrations: result.registrations,
    total: result.total,
    limit,
    offset,
  });
}
