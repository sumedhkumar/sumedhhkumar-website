import { experts } from "@/data/experts";
import {
  CAL_COM_TIME_ZONE,
  CalComAppError,
  formatIstDateKey,
  getAvailableSlotsForExpert,
} from "@/lib/server/calcom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxRangeMs = 62 * 24 * 60 * 60 * 1000;
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const IST_OFFSET_MINUTES = 330;

type RouteContext = {
  params: Promise<{ expertId: string }>;
};

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return Response.json(body, { ...init, headers });
}

function parseDateInput(value: string, boundary: "start" | "end") {
  if (dateOnlyPattern.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const utcMs =
      Date.UTC(
        year,
        month - 1,
        day,
        boundary === "start" ? 0 : 23,
        boundary === "start" ? 0 : 59,
        boundary === "start" ? 0 : 59,
        boundary === "start" ? 0 : 999,
      ) -
      IST_OFFSET_MINUTES * 60_000;
    return new Date(utcMs);
  }

  return new Date(value);
}

export async function GET(request: Request, context: RouteContext) {
  const { expertId } = await context.params;
  const expert = experts.find((item) => item.id === expertId && item.active);

  if (!expert) {
    return jsonNoStore(
      { success: false, message: "Expert is unavailable." },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const startParam = url.searchParams.get("start") ?? "";
  const endParam = url.searchParams.get("end") ?? "";

  if (!startParam || !endParam) {
    return jsonNoStore(
      { success: false, message: "Start and end dates are required." },
      { status: 400 },
    );
  }

  const start = parseDateInput(startParam, "start");
  const end = parseDateInput(endParam, "end");

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return jsonNoStore(
      { success: false, message: "Start and end dates must be valid." },
      { status: 400 },
    );
  }

  if (end <= start) {
    return jsonNoStore(
      { success: false, message: "End date must be after start date." },
      { status: 400 },
    );
  }

  if (end.getTime() - start.getTime() > maxRangeMs) {
    return jsonNoStore(
      { success: false, message: "Date range cannot exceed 62 days." },
      { status: 400 },
    );
  }

  try {
    const slots = await getAvailableSlotsForExpert({
      expertId,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    return jsonNoStore({
      success: true,
      expertId,
      durationMinutes: 30,
      timeZone: CAL_COM_TIME_ZONE,
      slots: slots.map((slot) => ({
        ...slot,
        dateKey: slot.dateKey || formatIstDateKey(new Date(slot.startUtc)),
      })),
    });
  } catch (error) {
    if (error instanceof CalComAppError) {
      return jsonNoStore(
        {
          success: false,
          message:
            error.code === "calcom_not_configured"
              ? "Live booking availability is not configured for this expert yet."
              : "Live booking availability could not be loaded. Please try again.",
        },
        { status: error.code === "calcom_not_configured" ? 503 : 502 },
      );
    }

    return jsonNoStore(
      {
        success: false,
        message: "Live booking availability could not be loaded. Please try again.",
      },
      { status: 502 },
    );
  }
}
