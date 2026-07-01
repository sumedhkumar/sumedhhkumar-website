import {
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { hasValidAdminToken } from "@/lib/server/admin-auth";
import {
  updateCourseRegistrationAdminStatus,
  type CourseAccessStatus,
  type CoursePaymentStatus,
  type UpdateCourseRegistrationAdminInput,
} from "@/lib/server/persistence";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type PatchBody = {
  accessStatus?: unknown;
  paymentStatus?: unknown;
};

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
const allowedPatchKeys = new Set(["accessStatus", "paymentStatus"]);

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validatePatchKeys(body: unknown) {
  if (!isJsonObject(body)) {
    return Response.json(
      {
        ok: false,
        message: "Request body must be a JSON object.",
      },
      { status: 400 },
    );
  }

  const unexpectedKey = Object.keys(body).find(
    (key) => !allowedPatchKeys.has(key),
  );

  if (unexpectedKey) {
    return Response.json(
      {
        ok: false,
        message: `Field ${unexpectedKey} cannot be updated here.`,
      },
      { status: 400 },
    );
  }

  return null;
}

function readStatus<T extends string>(
  value: unknown,
  allowedValues: Set<T>,
  label: string,
) {
  if (value === undefined) {
    return { ok: true as const, value: undefined };
  }

  if (typeof value !== "string" || !allowedValues.has(value as T)) {
    return {
      ok: false as const,
      response: Response.json(
        {
          ok: false,
          message: `Invalid ${label}.`,
        },
        { status: 400 },
      ),
    };
  }

  return { ok: true as const, value: value as T };
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasValidAdminToken(request)) {
    return Response.json(
      { ok: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  const body = (await request.json().catch(() => ({}))) as PatchBody;
  const keyValidationResponse = validatePatchKeys(body);

  if (keyValidationResponse) {
    return keyValidationResponse;
  }

  const accessStatus = readStatus(
    body.accessStatus,
    accessStatuses,
    "accessStatus",
  );
  const paymentStatus = readStatus(
    body.paymentStatus,
    paymentStatuses,
    "paymentStatus",
  );

  if (!accessStatus.ok) {
    return accessStatus.response;
  }

  if (!paymentStatus.ok) {
    return paymentStatus.response;
  }

  const input: UpdateCourseRegistrationAdminInput = {};

  if (accessStatus.value) {
    input.accessStatus = accessStatus.value;
  }

  if (paymentStatus.value) {
    input.paymentStatus = paymentStatus.value;
  }

  if (!input.accessStatus && !input.paymentStatus) {
    return Response.json(
      {
        ok: false,
        message: "Provide accessStatus or paymentStatus to update.",
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const registration = await updateCourseRegistrationAdminStatus(id, input);

  if (!registration) {
    return Response.json(
      {
        ok: false,
        message: "Course registration not found.",
      },
      { status: 404 },
    );
  }

  return Response.json({
    ok: true,
    registration,
  });
}
