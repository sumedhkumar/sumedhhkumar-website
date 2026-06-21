import {
  hasSmtpConfiguration,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { sendContactEmails } from "@/lib/email";
import { formatIstDateTime } from "@/lib/time";
import {
  hashClientIp,
  saveContactSubmission,
  summarizePersistenceError,
  updateSubmissionEmailStatus,
} from "@/lib/server/persistence";
import { experts } from "@/data/experts";

export const runtime = "nodejs";

const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const requestsByIp = new Map<string, number[]>();

type FormErrors = Record<string, string>;

type ContactRequestBody = {
  fullName?: string;
  emailAddress?: string;
  phoneOrWhatsapp?: string;
  subject?: string;
  message?: string;
  enquiryType?: string;
  expertSlug?: string;
  website?: string;
};

function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recentRequests = (requestsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < requestWindowMs,
  );

  if (recentRequests.length >= maxRequestsPerWindow) {
    requestsByIp.set(ip, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestsByIp.set(ip, recentRequests);
  return false;
}

function validateSubmission({
  fullName,
  emailAddress,
  message,
}: {
  fullName: string;
  emailAddress: string;
  message: string;
}) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!fullName) {
    errors.fullName = "Enter your full name.";
  }

  if (!emailPattern.test(emailAddress)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (message.length < 10) {
    errors.message = "Write your enquiry message.";
  }

  if (message.length > 3000) {
    errors.message = "Keep your message within 3000 characters.";
  }

  return errors;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 429 },
    );
  }

  const body = (await request.json()) as ContactRequestBody;

  if (sanitizeText(body.website)) {
    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 400 },
    );
  }

  const fullName = sanitizeText(body.fullName);
  const emailAddress = sanitizeText(body.emailAddress);
  const phoneOrWhatsapp = sanitizeText(body.phoneOrWhatsapp);
  const enquiryType = sanitizeText(body.enquiryType);
  const expert =
    enquiryType === "expert_booking"
      ? experts.find((item) => item.slug === sanitizeText(body.expertSlug) && item.active)
      : null;
  const subject = expert
    ? `Expert consultation booking enquiry - ${expert.fullName}`
    : sanitizeText(body.subject);
  const message = expert
    ? `Booking enquiry for a consultation with ${expert.fullName}.`
    : sanitizeText(body.message);
  const errors = validateSubmission({
    fullName,
    emailAddress,
    message,
  });

  if (enquiryType === "expert_booking" && !expert) {
    errors.expertSlug = "Select a valid expert.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
        errors,
      },
      { status: 400 },
    );
  }

  if (!isProductionPersistenceConfigured() || !hasSmtpConfiguration()) {
    return serviceUnavailableResponse();
  }

  const timestamp = new Date().toISOString();
  let submissionId = "";

  try {
    const submission = await saveContactSubmission({
      timestamp,
      submittedAtIstDisplay: formatIstDateTime(timestamp) ?? "",
      fullName,
      emailAddress,
      phoneOrWhatsapp,
      subject,
      message,
      clientIpHash: hashClientIp(ip),
      userAgent: request.headers.get("user-agent") ?? "",
      rawPayload: {
        fullName,
        emailAddress,
        phoneOrWhatsapp,
        subject,
        message,
        enquiryType: expert ? "expert_booking" : "contact",
        expertSlug: expert?.slug ?? "",
        expertName: expert?.fullName ?? "",
      },
    });
    submissionId = submission.id;
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }

  try {
    await sendContactEmails({
      timestamp,
      fullName,
      emailAddress,
      phoneOrWhatsapp,
      subject,
      message,
      enquiryType: expert ? "expert_booking" : undefined,
      expertName: expert?.fullName,
    });
    await updateSubmissionEmailStatus(submissionId, "sent");

    return Response.json({
      ok: true,
      message:
        "Your enquiry has been submitted. Vyntegra will get back to you soon.",
    });
  } catch (error) {
    try {
      await updateSubmissionEmailStatus(
        submissionId,
        "failed",
        summarizePersistenceError(error),
      );
    } catch {
      // Preserve the existing safe error response if the status write also fails.
    }

    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
