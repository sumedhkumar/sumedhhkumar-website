import { hasSmtpConfiguration, serviceUnavailableResponse } from "@/lib/config";
import { sendContactEmails } from "@/lib/email";

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
  const subject = sanitizeText(body.subject);
  const message = sanitizeText(body.message);
  const errors = validateSubmission({
    fullName,
    emailAddress,
    message,
  });

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

  if (!hasSmtpConfiguration()) {
    return serviceUnavailableResponse();
  }

  try {
    await sendContactEmails({
      timestamp: new Date().toISOString(),
      fullName,
      emailAddress,
      phoneOrWhatsapp,
      subject,
      message,
    });

    return Response.json({
      ok: true,
      message:
        "Your enquiry has been submitted. Vyntegra will get back to you soon.",
    });
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
