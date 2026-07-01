import type { User } from "@supabase/supabase-js";
import {
  appConfig,
  hasSmtpConfiguration,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import {
  sendCourseRegistrationAdminEmail,
  sendCourseRegistrationUserEmail,
} from "@/lib/email";
import type {
  CourseLoginProvider,
  CourseRegistration,
} from "@/lib/server/persistence";
import { algoTradingCourse } from "@/data/algo-trading-course";
import {
  getCourseRegistrationByUserId,
  updateCourseRegistrationLastLogin,
  upsertCourseRegistration,
} from "@/lib/server/persistence";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

type CourseRegistrationRequestBody = {
  fullName?: unknown;
  whatsappNumber?: unknown;
  courseSlug?: unknown;
  source?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
};

type FormErrors = Record<string, string>;

const courseSlug = algoTradingCourse.slug;
const courseName = algoTradingCourse.name;
const accessPath = algoTradingCourse.accessRoute;

function sanitizeText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function toPublicRegistration(registration: CourseRegistration) {
  return {
    id: registration.id,
    fullName: registration.fullName,
    email: registration.email,
    whatsappNumber: registration.whatsappNumber,
    courseSlug: registration.courseSlug,
    loginProvider: registration.loginProvider,
    source: registration.source,
    utmSource: registration.utmSource,
    utmMedium: registration.utmMedium,
    utmCampaign: registration.utmCampaign,
    lastLoginAt: registration.lastLoginAt,
    registeredAt: registration.registeredAt,
    updatedAt: registration.updatedAt,
  };
}

function getLoginProvider(user: User): CourseLoginProvider {
  const appProvider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : "";
  const hasGoogleIdentity =
    user.identities?.some((identity) => identity.provider === "google") ?? false;

  return appProvider === "google" || hasGoogleIdentity
    ? "google"
    : "email_password";
}

function validateRegistration({
  fullName,
  whatsappNumber,
  requestedCourseSlug,
}: {
  fullName: string;
  whatsappNumber: string;
  requestedCourseSlug: string;
}) {
  const errors: FormErrors = {};
  const normalizedWhatsapp = whatsappNumber.replace(/\s/g, "");

  if (requestedCourseSlug && requestedCourseSlug !== courseSlug) {
    errors.courseSlug = "Select a valid course.";
  }

  if (fullName.length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (fullName.length > 120) {
    errors.fullName = "Keep your full name within 120 characters.";
  }

  if (!whatsappNumber) {
    errors.whatsappNumber = "Enter your WhatsApp number.";
  } else if (normalizedWhatsapp.length < 8 || normalizedWhatsapp.length > 20) {
    errors.whatsappNumber = "Enter a reasonable WhatsApp number.";
  }

  return errors;
}

function buildAbsoluteUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const baseUrl = appConfig.appBaseUrl || requestUrl.origin;

  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function getAuthenticatedUser(): Promise<
  { response: Response; user: null } | { response: null; user: User }
> {
  if (!isSupabaseAuthConfigured()) {
    return {
      response: Response.json(
        {
          ok: false,
          message:
            "Course account access is not configured yet. Set the Supabase Auth environment variables.",
        },
        { status: 503 },
      ),
      user: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      response: Response.json(
        {
          ok: false,
          message: "Please log in before registering for the course.",
        },
        { status: 401 },
      ),
      user: null,
    };
  }

  return { response: null, user };
}

export async function GET() {
  const auth = await getAuthenticatedUser();

  if (auth.response) {
    return auth.response;
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  try {
    const registration = await getCourseRegistrationByUserId(
      auth.user.id,
      courseSlug,
    );
    const updatedRegistration = registration
      ? await updateCourseRegistrationLastLogin(auth.user.id, courseSlug)
      : null;

    return Response.json({
      ok: true,
      registration: updatedRegistration
        ? toPublicRegistration(updatedRegistration)
        : registration
          ? toPublicRegistration(registration)
          : null,
    });
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Course registration could not be loaded. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as CourseRegistrationRequestBody;
  const fullName = sanitizeText(body.fullName, 120);
  const whatsappNumber = sanitizeText(body.whatsappNumber, 32);
  const requestedCourseSlug = sanitizeText(body.courseSlug, 80);
  const errors = validateRegistration({
    fullName,
    whatsappNumber,
    requestedCourseSlug,
  });

  if (!auth.user.email) {
    errors.email = "Your Supabase account does not include an email address.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json(
      {
        ok: false,
        message: "Course registration could not be saved.",
        errors,
      },
      { status: 400 },
    );
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  try {
    const existingRegistration = await getCourseRegistrationByUserId(
      auth.user.id,
      courseSlug,
    );
    const loginProvider = getLoginProvider(auth.user);
    const registration = await upsertCourseRegistration({
      userId: auth.user.id,
      fullName,
      email: auth.user.email ?? "",
      whatsappNumber,
      courseSlug,
      loginProvider,
      source: sanitizeText(body.source, 120),
      utmSource: sanitizeText(body.utmSource, 120),
      utmMedium: sanitizeText(body.utmMedium, 120),
      utmCampaign: sanitizeText(body.utmCampaign, 120),
    });
    const updatedRegistration =
      (await updateCourseRegistrationLastLogin(auth.user.id, courseSlug)) ??
      registration;
    let emailSent = false;

    if (!existingRegistration && hasSmtpConfiguration()) {
      try {
        const emailInput = {
          fullName: registration.fullName,
          email: registration.email,
          whatsappNumber: registration.whatsappNumber,
          courseName,
          courseSlug: registration.courseSlug,
          loginProvider,
          registeredAt: registration.registeredAt,
          accessUrl: buildAbsoluteUrl(request, accessPath),
          source: registration.source,
          utmSource: registration.utmSource,
          utmMedium: registration.utmMedium,
          utmCampaign: registration.utmCampaign,
          accessStatus: registration.accessStatus,
          paymentStatus: registration.paymentStatus,
        };

        await sendCourseRegistrationUserEmail(emailInput);
        await sendCourseRegistrationAdminEmail(emailInput);
        emailSent = true;
      } catch {
        console.warn("Course registration email delivery failed.");
      }
    }

    return Response.json({
      ok: true,
      message: "Course registration saved.",
      registration: toPublicRegistration(updatedRegistration),
      emailSent,
    });
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Course registration could not be saved. Please try again.",
      },
      { status: 500 },
    );
  }
}
