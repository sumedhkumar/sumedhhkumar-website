import { isProductionPersistenceConfigured, serviceUnavailableResponse } from "@/lib/config";
import { hasValidAdminToken } from "@/lib/server/admin-auth";
import { getSubmissionAttachment } from "@/lib/server/persistence";
import {
  downloadPrivateSubmissionAttachment,
  isAttachmentStorageConfigured,
} from "@/lib/server/supabase-storage";

export const runtime = "nodejs";

function safeFilename(filename: string) {
  return filename.replace(/[\r\n"\\]/g, "_") || "attachment";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ submissionId: string; attachmentId: string }> },
) {
  if (!hasValidAdminToken(request)) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  if (!isAttachmentStorageConfigured()) {
    return Response.json({ message: "Attachment storage is unavailable." }, { status: 500 });
  }

  const { submissionId, attachmentId } = await context.params;
  const attachment = await getSubmissionAttachment(submissionId, attachmentId);

  if (!attachment) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  try {
    const downloaded = await downloadPrivateSubmissionAttachment(
      attachment.storage_bucket,
      attachment.storage_path,
    );
    return new Response(downloaded.data, {
      headers: {
        "Content-Type": attachment.content_type,
        "Content-Disposition": `attachment; filename="${safeFilename(attachment.safe_filename)}"`,
        "Content-Length": attachment.size_bytes.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ message: "Attachment download failed." }, { status: 500 });
  }
}
