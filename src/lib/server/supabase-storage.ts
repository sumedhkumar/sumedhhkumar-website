import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appConfig, isAttachmentStorageConfigured as hasAttachmentStorageConfig } from "@/lib/config";
import type { SubmissionType } from "@/lib/server/persistence";

type SupabaseGlobal = typeof globalThis & {
  vyntegraSupabaseAdmin?: SupabaseClient;
};

const supabaseGlobal = globalThis as SupabaseGlobal;

const detectedExtensions: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/zip": ".zip",
};

export function isAttachmentStorageConfigured() {
  return hasAttachmentStorageConfig();
}

export function getSupabaseAdminClient() {
  if (!isAttachmentStorageConfigured()) {
    throw new Error("Private attachment storage is not configured.");
  }

  if (!supabaseGlobal.vyntegraSupabaseAdmin) {
    supabaseGlobal.vyntegraSupabaseAdmin = createClient(
      appConfig.supabaseUrl,
      appConfig.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return supabaseGlobal.vyntegraSupabaseAdmin;
}

export function sanitizeStorageFilename(filename: string, contentType = "") {
  const normalized = filename
    .normalize("NFKD")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\\/]+/g, "-")
    .trim()
    .toLowerCase();
  const extensionMatch = normalized.match(/\.([a-z0-9]{1,10})$/i);
  const detectedExtension = extensionMatch
    ? `.${extensionMatch[1].toLowerCase()}`
    : detectedExtensions[contentType.toLowerCase()] ?? "";
  const stem = (extensionMatch
    ? normalized.slice(0, -detectedExtension.length)
    : normalized
  )
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/[._]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const maxStemLength = Math.max(1, 120 - detectedExtension.length);
  const safeStem = stem.slice(0, maxStemLength).replace(/-+$/g, "") || "attachment";

  return `${safeStem}${detectedExtension}`.slice(0, 120);
}

export function buildSubmissionAttachmentPath(input: {
  submissionType: SubmissionType;
  timestamp: string;
  submissionId: string;
  attachmentId: string;
  safeFilename: string;
}) {
  const submittedAt = new Date(input.timestamp);

  if (Number.isNaN(submittedAt.getTime())) {
    throw new Error("Invalid submission timestamp.");
  }

  const year = submittedAt.getUTCFullYear().toString();
  const month = (submittedAt.getUTCMonth() + 1).toString().padStart(2, "0");
  return `submissions/${input.submissionType}/${year}/${month}/${input.submissionId}/${input.attachmentId}-${input.safeFilename}`;
}

export async function uploadPrivateSubmissionAttachment(input: {
  path: string;
  content: Buffer;
  contentType: string;
}) {
  const bucket = appConfig.supabaseStorageBucket;
  const { error } = await getSupabaseAdminClient().storage.from(bucket).upload(
    input.path,
    Uint8Array.from(input.content),
    {
      contentType: input.contentType,
      upsert: false,
    },
  );

  if (error) {
    throw new Error("Private attachment upload failed.");
  }

  return { bucket, path: input.path };
}

export async function downloadPrivateSubmissionAttachment(
  bucket: string,
  path: string,
) {
  const { data, error } = await getSupabaseAdminClient().storage
    .from(bucket)
    .download(path);

  if (error || !data) {
    throw new Error("Private attachment download failed.");
  }

  return {
    data: await data.arrayBuffer(),
    contentType: data.type || undefined,
  };
}

export async function deletePrivateSubmissionAttachment(
  bucket: string,
  path: string,
) {
  const { error } = await getSupabaseAdminClient().storage.from(bucket).remove([path]);

  if (error) {
    throw new Error("Private attachment cleanup failed.");
  }
}
