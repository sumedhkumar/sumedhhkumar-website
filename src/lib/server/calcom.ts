import "server-only";
import type { CalComSlot } from "@/types";

export const CAL_COM_BASE_URL =
  process.env.CAL_COM_BASE_URL || "https://api.cal.com/v2";
export const CAL_COM_TIME_ZONE =
  process.env.CAL_COM_TIME_ZONE || "Asia/Kolkata";

const SLOTS_API_VERSION =
  process.env.CAL_COM_SLOTS_API_VERSION || "2024-09-04";
const BOOKINGS_API_VERSION =
  process.env.CAL_COM_BOOKINGS_API_VERSION || "2026-02-25";
const SESSION_DURATION_MINUTES = 30;
const IST_OFFSET_MINUTES = 330;

export class CalComAppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 502, code = "calcom_error") {
    super(message);
    this.name = "CalComAppError";
    this.status = status;
    this.code = code;
  }
}

type CalComConfig = {
  eventTypeId: number;
};

type CalComFetchOptions = RequestInit & {
  apiVersion: string;
};

type RawSlotRange = {
  start?: unknown;
  end?: unknown;
};

type CalComBookingResult = {
  uid?: string;
  id?: number | string;
  status?: string;
  location?: string;
  meetingUrl?: string;
};

function getApiKey() {
  return process.env.CAL_COM_API_KEY || "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function sanitizeErrorMessage(value: unknown) {
  if (!value) {
    return "Cal.com request failed.";
  }

  if (typeof value === "string") {
    return value.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
  }

  if (isRecord(value)) {
    const message = value.message || value.error || value.detail;
    if (typeof message === "string") {
      return sanitizeErrorMessage(message);
    }
  }

  return "Cal.com request failed.";
}

function toIstDate(date: Date) {
  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000);
}

function formatIstIso(date: Date) {
  const ist = toIstDate(date);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  const hours = String(ist.getUTCHours()).padStart(2, "0");
  const minutes = String(ist.getUTCMinutes()).padStart(2, "0");
  const seconds = String(ist.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

export function formatIstDateKey(date: Date) {
  const ist = toIstDate(date);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatIstTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: CAL_COM_TIME_ZONE,
  })
    .format(date)
    .replace(/\s/g, " ");
}

function normalizeSlot(startValue: unknown, endValue?: unknown): CalComSlot | null {
  if (typeof startValue !== "string") {
    return null;
  }

  const start = new Date(startValue);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const parsedEnd =
    typeof endValue === "string" ? new Date(endValue) : null;
  const end =
    parsedEnd && !Number.isNaN(parsedEnd.getTime())
      ? parsedEnd
      : new Date(start.getTime() + SESSION_DURATION_MINUTES * 60_000);

  return {
    startUtc: start.toISOString(),
    startIst: formatIstIso(start),
    endUtc: end.toISOString(),
    dateKey: formatIstDateKey(start),
    timeLabel: formatIstTimeLabel(start),
    displayLabel: `${formatIstTimeLabel(start)} IST`,
  };
}

function collectSlots(payload: unknown) {
  const slots: CalComSlot[] = [];
  const root = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
  const dateKeyedSlots =
    isRecord(root) && isRecord(root.slots) ? root.slots : root;

  if (!isRecord(dateKeyedSlots)) {
    return slots;
  }

  for (const value of Object.values(dateKeyedSlots)) {
    if (!Array.isArray(value)) {
      continue;
    }

    for (const entry of value) {
      if (typeof entry === "string") {
        const slot = normalizeSlot(entry);
        if (slot) slots.push(slot);
        continue;
      }

      if (isRecord(entry)) {
        const range = entry as RawSlotRange;
        const slot = normalizeSlot(range.start, range.end);
        if (slot) slots.push(slot);
      }
    }
  }

  return slots.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
}

export function getCalComConfigForExpert(expertId: string): CalComConfig | null {
  if (expertId !== "expert-sumedh-kumar") {
    return null;
  }

  const eventTypeId = Number(process.env.CAL_COM_EVENT_TYPE_ID_SUMEDH_KUMAR);
  return Number.isFinite(eventTypeId) && eventTypeId > 0
    ? { eventTypeId }
    : null;
}

export function assertCalComConfigured(expertId: string) {
  const apiKey = getApiKey();
  const config = getCalComConfigForExpert(expertId);

  if (!apiKey || !config) {
    throw new CalComAppError(
      "Cal.com booking is not configured for this expert yet.",
      503,
      "calcom_not_configured",
    );
  }

  return { apiKey, ...config };
}

export async function calComFetch(path: string, options: CalComFetchOptions) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new CalComAppError(
      "Cal.com booking is not configured yet.",
      503,
      "calcom_not_configured",
    );
  }

  const response = await fetch(`${CAL_COM_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": options.apiVersion,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new CalComAppError(
      sanitizeErrorMessage(payload),
      response.status,
      "calcom_request_failed",
    );
  }

  return payload;
}

export async function getAvailableSlotsForExpert({
  expertId,
  start,
  end,
}: {
  expertId: string;
  start: string;
  end: string;
}) {
  const { eventTypeId } = assertCalComConfigured(expertId);
  const params = new URLSearchParams({
    eventTypeId: String(eventTypeId),
    start,
    end,
    timeZone: CAL_COM_TIME_ZONE,
    duration: String(SESSION_DURATION_MINUTES),
    format: "range",
  });
  const payload = await calComFetch(`/slots?${params.toString()}`, {
    method: "GET",
    apiVersion: SLOTS_API_VERSION,
  });

  return collectSlots(payload);
}

function normalizeBooking(payload: unknown): CalComBookingResult {
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (!isRecord(data)) {
    return {};
  }

  return {
    uid: typeof data.uid === "string" ? data.uid : undefined,
    id:
      typeof data.id === "string" || typeof data.id === "number"
        ? data.id
        : undefined,
    status: typeof data.status === "string" ? data.status : undefined,
    location: typeof data.location === "string" ? data.location : undefined,
    meetingUrl:
      typeof data.meetingUrl === "string"
        ? data.meetingUrl
        : typeof data.videoCallUrl === "string"
          ? data.videoCallUrl
          : undefined,
  };
}

export async function createExpertBooking({
  expertId,
  slotStartUtc,
  customerName,
  customerEmail,
  customerPhone,
  razorpayOrderId,
  razorpayPaymentId,
  purchaseName,
}: {
  expertId: string;
  slotStartUtc: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  purchaseName: string;
}) {
  const { eventTypeId } = assertCalComConfigured(expertId);
  const body = {
    start: slotStartUtc,
    eventTypeId,
    attendee: {
      name: customerName,
      email: customerEmail,
      timeZone: CAL_COM_TIME_ZONE,
      language: "en",
      ...(customerPhone ? { phoneNumber: customerPhone } : {}),
    },
    metadata: {
      razorpayOrderId,
      razorpayPaymentId,
      source: "vyntegra-talk-to-expert",
      purchaseName,
    },
  };

  const payload = await calComFetch("/bookings", {
    method: "POST",
    apiVersion: BOOKINGS_API_VERSION,
    body: JSON.stringify(body),
  });
  return normalizeBooking(payload);
}
