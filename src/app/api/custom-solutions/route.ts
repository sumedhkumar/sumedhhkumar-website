import {
  hasSmtpConfiguration,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import { sendCustomSolutionsEmails } from "@/lib/email";
import { formatIstDateTime } from "@/lib/time";
import {
  hashClientIp,
  saveCustomSolutionSubmission,
  summarizePersistenceError,
  updateSubmissionEmailStatus,
} from "@/lib/server/persistence";
import { createHash, randomUUID } from "node:crypto";
import {
  buildSubmissionAttachmentPath,
  deletePrivateSubmissionAttachment,
  isAttachmentStorageConfigured,
  sanitizeStorageFilename,
  uploadPrivateSubmissionAttachment,
} from "@/lib/server/supabase-storage";

export const runtime = "nodejs";

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
];
const maxFileSizeBytes = 10 * 1024 * 1024;
const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const requestsByIp = new Map<string, number[]>();

type FormErrors = Record<string, string>;

function sanitizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
}

function hasAllowedExtension(fileName: string) {
  return allowedExtensions.some((extension) =>
    fileName.toLowerCase().endsWith(extension),
  );
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
  phoneOrWhatsapp,
  solutionType,
  requirementsDescription,
  preferredTimeline,
  supportingFile,
}: {
  fullName: string;
  emailAddress: string;
  phoneOrWhatsapp: string;
  solutionType: string;
  requirementsDescription: string;
  preferredTimeline: string;
  supportingFile: File | null;
}) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!fullName) {
    errors.fullName = "Enter your full name.";
  }

  if (!emailPattern.test(emailAddress)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (!phoneOrWhatsapp) {
    errors.phoneOrWhatsapp = "Enter your phone or WhatsApp number.";
  }

  if (!solutionType) {
    errors.solutionType = "Select the type of solution required.";
  }

  if (requirementsDescription.length < 30) {
    errors.requirementsDescription =
      "Describe your requirements in at least 30 characters.";
  }

  if (requirementsDescription.length > 3000) {
    errors.requirementsDescription =
      "Keep your requirements within 3000 characters.";
  }

  if (!preferredTimeline) {
    errors.preferredTimeline = "Select your preferred timeline.";
  }

  if (supportingFile && !hasAllowedExtension(supportingFile.name)) {
    errors.supportingFile =
      "Upload a PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or ZIP file.";
  }

  if (supportingFile && supportingFile.size > maxFileSizeBytes) {
    errors.supportingFile = "Upload a file smaller than or equal to 10 MB.";
  }

  return errors;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return Response.json(
      {
        ok: false,
        message: "Your requirements could not be submitted. Please try again.",
      },
      { status: 429 },
    );
  }

  const formData = await request.formData();

  if (sanitizeText(formData.get("website"))) {
    return Response.json(
      {
        ok: false,
        message: "Your requirements could not be submitted. Please try again.",
      },
      { status: 400 },
    );
  }

  const fullName = sanitizeText(formData.get("fullName"));
  const emailAddress = sanitizeText(formData.get("emailAddress"));
  const phoneOrWhatsapp = sanitizeText(formData.get("phoneOrWhatsapp"));
  const companyOrOrganization = sanitizeText(
    formData.get("companyOrOrganization"),
  );
  const solutionType = sanitizeText(formData.get("solutionType"));
  const requirementsDescription = sanitizeText(
    formData.get("requirementsDescription"),
  );
  const preferredTimeline = sanitizeText(formData.get("preferredTimeline"));
  const sourcePage = sanitizeText(formData.get("sourcePage"));
  const fileValue = formData.get("supportingFile");
  const supportingFile =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  const errors = validateSubmission({
    fullName,
    emailAddress,
    phoneOrWhatsapp,
    solutionType,
    requirementsDescription,
    preferredTimeline,
    supportingFile,
  });

  if (Object.keys(errors).length > 0) {
    return Response.json(
      {
        ok: false,
        message: "Your requirements could not be submitted. Please try again.",
        errors,
      },
      { status: 400 },
    );
  }

  if (
    !isProductionPersistenceConfigured() ||
    !hasSmtpConfiguration() ||
    (supportingFile && !isAttachmentStorageConfigured())
  ) {
    return serviceUnavailableResponse();
  }

  const timestamp = new Date().toISOString();
  const attachmentSubmissionId = supportingFile ? randomUUID() : "";
  let attachment:
    | {
        id: string;
        kind: "custom_solution_supporting_file";
        filename: string;
        safeFilename: string;
        contentType: string;
        sizeBytes: number;
        sha256Hash: string;
        storageBucket: string;
        storagePath: string;
      }
    | undefined;
  let emailAttachment:
    | { filename: string; content: Buffer; contentType: string }
    | undefined;

  if (supportingFile) {
    try {
      const content = Buffer.from(await supportingFile.arrayBuffer());
      const attachmentId = randomUUID();
      const contentType = supportingFile.type || "application/octet-stream";
      const safeFilename = sanitizeStorageFilename(supportingFile.name, contentType);
      const storagePath = buildSubmissionAttachmentPath({
        submissionType: "custom_solution",
        timestamp,
        submissionId: attachmentSubmissionId,
        attachmentId,
        safeFilename,
      });
      const uploaded = await uploadPrivateSubmissionAttachment({
        path: storagePath,
        content,
        contentType,
      });
      attachment = {
        id: attachmentId,
        kind: "custom_solution_supporting_file",
        filename: supportingFile.name,
        safeFilename,
        contentType,
        sizeBytes: content.byteLength,
        sha256Hash: createHash("sha256").update(content).digest("hex"),
        storageBucket: uploaded.bucket,
        storagePath: uploaded.path,
      };
      emailAttachment = {
        filename: supportingFile.name,
        content,
        contentType,
      };
    } catch {
      return Response.json(
        {
          ok: false,
          message: "Your requirements could not be submitted. Please try again.",
        },
        { status: 500 },
      );
    }
  }
  let submissionId = "";

  try {
    const submission = await saveCustomSolutionSubmission({
      submissionId: attachmentSubmissionId || undefined,
      timestamp,
      submittedAtIstDisplay: formatIstDateTime(timestamp) ?? "",
      fullName,
      emailAddress,
      phoneOrWhatsapp,
      companyOrOrganization,
      solutionType,
      requirementsDescription,
      preferredTimeline,
      sourcePage: sourcePage || "Homepage Custom Solutions Section",
      clientIpHash: hashClientIp(ip),
      userAgent: request.headers.get("user-agent") ?? "",
      rawPayload: {
        fullName,
        emailAddress,
        phoneOrWhatsapp,
        companyOrOrganization,
        solutionType,
        requirementsDescription,
        preferredTimeline,
        sourcePage: sourcePage || "Homepage Custom Solutions Section",
        supportingFile: supportingFile
          ? {
              filename: supportingFile.name,
              contentType: supportingFile.type,
              sizeBytes: supportingFile.size,
            }
          : null,
      },
      attachment,
    });
    submissionId = submission.id;
  } catch {
    if (attachment) {
      try {
        await deletePrivateSubmissionAttachment(
          attachment.storageBucket,
          attachment.storagePath,
        );
      } catch {
        // The failed database write remains the primary failure response.
      }
    }

    return Response.json(
      {
        ok: false,
        message: "Your requirements could not be submitted. Please try again.",
      },
      { status: 500 },
    );
  }

  try {
    await sendCustomSolutionsEmails({
      timestamp,
      fullName,
      emailAddress,
      phoneOrWhatsapp,
      companyOrOrganization,
      solutionType,
      requirementsDescription,
      preferredTimeline,
      supportingFileInformation: supportingFile
        ? `${supportingFile.name} (${supportingFile.size} bytes)`
        : "No supporting file uploaded",
      sourcePage: sourcePage || "Homepage Custom Solutions Section",
      attachment: emailAttachment,
    });
    await updateSubmissionEmailStatus(submissionId, "sent");

    return Response.json({
      ok: true,
      message:
        "Your requirement has been submitted. Vyntegra will review it and respond within 24 hours.",
    });
  } catch (error) {
    try {
      await updateSubmissionEmailStatus(
        submissionId,
        "failed",
        summarizePersistenceError(error),
      );
    } catch {
      // Keep the client-facing response stable when the status update fails.
    }

    return Response.json(
      {
        ok: false,
        message: "Your requirements could not be submitted. Please try again.",
      },
      { status: 500 },
    );
  }
}
