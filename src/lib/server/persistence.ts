import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { PoolClient, QueryResultRow } from "pg";
import { appConfig, isProductionPersistenceConfigured } from "@/lib/config";
import { queryDb, withDbClient } from "@/lib/server/db";

export type EmailStatus = "pending" | "sent" | "failed" | "skipped";
export type SubmissionType =
  | "contact"
  | "custom_solution"
  | "crypto_payment_proof"
  | "crypto_payment_query";
export type PurchaseType = "product" | "expert";
type JsonRecord = Record<string, unknown>;
export type CourseAccessStatus = "free_access" | "paid" | "blocked";
export type CoursePaymentStatus = "unpaid" | "paid" | "manual_verification";
export type CourseLoginProvider = "google" | "email_password";

export type AttachmentInput = {
  id: string;
  kind: "crypto_payment_screenshot" | "custom_solution_supporting_file";
  filename: string;
  safeFilename: string;
  contentType: string;
  sizeBytes: number;
  sha256Hash: string;
  storageBucket: string;
  storagePath: string;
};

type SubmissionInput = {
  submissionId?: string;
  timestamp: string;
  submittedAtIstDisplay: string;
  fullName?: string;
  emailAddress?: string;
  phoneOrWhatsapp?: string;
  subject?: string;
  message?: string;
  companyOrOrganization?: string;
  solutionType?: string;
  requirementsDescription?: string;
  preferredTimeline?: string;
  sourcePage?: string;
  purchaseType?: PurchaseType;
  productId?: string;
  productSlug?: string;
  productName?: string;
  selectedPlanId?: string;
  selectedPlanName?: string;
  subscriptionDuration?: string;
  originalProductPrice?: string;
  couponCode?: string;
  discountAmount?: string;
  finalPayablePrice?: string;
  amountPaid?: string;
  cryptoToken?: string;
  cryptoNetwork?: string;
  cryptoWalletAddress?: string;
  transactionHash?: string;
  clientIpHash: string;
  userAgent: string;
  rawPayload: JsonRecord;
};

export type ContactSubmissionInput = SubmissionInput;
export type CustomSolutionSubmissionInput = SubmissionInput & {
  attachment?: AttachmentInput;
};
export type CryptoPaymentQuerySubmissionInput = SubmissionInput;
export type CryptoPaymentProofSubmissionInput = SubmissionInput & {
  attachment: AttachmentInput;
};

export type RazorpayOrderInput = {
  razorpayOrderId: string;
  targetType: PurchaseType;
  orderCreatedAt: string;
  orderCreatedAtIstDisplay: string;
  customerName: string;
  customerEmail: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  expertId?: string;
  expertSlug?: string;
  expertName?: string;
  sessionId?: string;
  sessionLabel?: string;
  sessionDurationMinutes?: number;
  slotStartUtc?: string;
  appointmentDate?: string;
  appointmentSlot?: string;
  selectedPlanId?: string;
  selectedPlanName?: string;
  subscriptionDuration?: string;
  originalPriceUsd?: number;
  discountUsd?: number;
  finalPriceUsd?: number;
  couponCode?: string;
  usdToInrRate?: number;
  usdToInrRateSource?: string;
  exchangeRateFetchedAtUtc?: string;
  exchangeRateFetchedAtIstDisplay?: string;
  exchangeRateIsFallback?: boolean;
  usdToInrEffectiveDateIst?: string;
  finalPriceInr?: number;
  amountPaise: number;
  currency: string;
  clientIpHash: string;
  userAgent: string;
  rawNotes: JsonRecord;
  rawOrder: JsonRecord;
};

export type RazorpayVerifiedPaymentInput = {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  purchaseType: PurchaseType;
  verifiedAt: string;
  verifiedAtIstDisplay: string;
  capturedAtUtc?: string;
  capturedAtIstDisplay?: string;
  customerPhone?: string;
  bookingStatus:
    | "not_applicable"
    | "pending"
    | "confirmed"
    | "manual_followup_required";
  razorpaySignatureHash: string;
  rawPayment: JsonRecord;
  rawVerificationPayload: JsonRecord;
};

export type StoredRazorpayPayment = {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  purchaseType: PurchaseType;
  verifiedAt: string;
  verifiedAtIstDisplay: string | null;
  capturedAtUtc: string | null;
  capturedAtIstDisplay: string | null;
  customerPhone: string | null;
  emailStatus: EmailStatus;
  bookingStatus: RazorpayVerifiedPaymentInput["bookingStatus"] | null;
  calBookingUid: string | null;
  calBookingStatus: string | null;
  calMeetingUrl: string | null;
  supportFollowupRequired: boolean;
  bookingErrorSummary: string | null;
};

export type CourseRegistration = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseSlug: string;
  accessStatus: CourseAccessStatus;
  paymentStatus: CoursePaymentStatus;
  loginProvider: CourseLoginProvider;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  hiddenBonusAgentAccessEligible: boolean;
  lastLoginAt: string | null;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type UpsertCourseRegistrationInput = {
  userId: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseSlug?: string;
  accessStatus?: CourseAccessStatus;
  paymentStatus?: CoursePaymentStatus;
  loginProvider?: CourseLoginProvider;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  hiddenBonusAgentAccessEligible?: boolean;
};

export type CourseRegistrationAdminRow = {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseSlug: string;
  accessStatus: CourseAccessStatus;
  paymentStatus: CoursePaymentStatus;
  loginProvider: CourseLoginProvider;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  lastLoginAt: string | null;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseRegistrationListFilters = {
  search?: string;
  accessStatus?: CourseAccessStatus;
  paymentStatus?: CoursePaymentStatus;
  loginProvider?: CourseLoginProvider;
  courseSlug?: string;
  limit: number;
  offset: number;
};

export type UpdateCourseRegistrationAdminInput = {
  accessStatus?: CourseAccessStatus;
  paymentStatus?: CoursePaymentStatus;
};

type StoredPaymentRow = QueryResultRow & {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  purchase_type: PurchaseType;
  verified_at: Date | string;
  verified_at_ist_display: string | null;
  captured_at_utc: Date | string | null;
  captured_at_ist_display: string | null;
  customer_phone: string | null;
  email_status: EmailStatus;
  booking_status: StoredRazorpayPayment["bookingStatus"];
  cal_booking_uid: string | null;
  cal_booking_status: string | null;
  cal_meeting_url: string | null;
  support_followup_required: boolean;
  booking_error_summary: string | null;
};

type CourseRegistrationRow = QueryResultRow & {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  course_slug: string;
  access_status: CourseAccessStatus;
  payment_status: CoursePaymentStatus;
  login_provider: CourseLoginProvider;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  hidden_bonus_agent_access_eligible: boolean;
  last_login_at: Date | string | null;
  registered_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
};

function toIso(value: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function optional(value?: string | number | boolean | null) {
  return value === "" || value === undefined ? null : value;
}

function requiredTrimmed(value: string | undefined, label: string) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}

function normalizeEmailAddress(email: string) {
  return requiredTrimmed(email, "Email").toLowerCase();
}

function toStoredPayment(row: StoredPaymentRow): StoredRazorpayPayment {
  return {
    razorpayPaymentId: row.razorpay_payment_id,
    razorpayOrderId: row.razorpay_order_id,
    purchaseType: row.purchase_type,
    verifiedAt: toIso(row.verified_at) ?? "",
    verifiedAtIstDisplay: row.verified_at_ist_display,
    capturedAtUtc: toIso(row.captured_at_utc),
    capturedAtIstDisplay: row.captured_at_ist_display,
    customerPhone: row.customer_phone,
    emailStatus: row.email_status,
    bookingStatus: row.booking_status,
    calBookingUid: row.cal_booking_uid,
    calBookingStatus: row.cal_booking_status,
    calMeetingUrl: row.cal_meeting_url,
    supportFollowupRequired: row.support_followup_required,
    bookingErrorSummary: row.booking_error_summary,
  };
}

function toCourseRegistration(row: CourseRegistrationRow): CourseRegistration {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    whatsappNumber: row.whatsapp_number,
    courseSlug: row.course_slug,
    accessStatus: row.access_status,
    paymentStatus: row.payment_status,
    loginProvider: row.login_provider,
    source: row.source,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    hiddenBonusAgentAccessEligible: row.hidden_bonus_agent_access_eligible,
    lastLoginAt: toIso(row.last_login_at),
    registeredAt: toIso(row.registered_at) ?? "",
    createdAt: toIso(row.created_at) ?? "",
    updatedAt: toIso(row.updated_at) ?? "",
  };
}

function toCourseRegistrationAdminRow(
  row: CourseRegistrationRow,
): CourseRegistrationAdminRow {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    whatsappNumber: row.whatsapp_number,
    courseSlug: row.course_slug,
    accessStatus: row.access_status,
    paymentStatus: row.payment_status,
    loginProvider: row.login_provider,
    source: row.source,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    lastLoginAt: toIso(row.last_login_at),
    registeredAt: toIso(row.registered_at) ?? "",
    createdAt: toIso(row.created_at) ?? "",
    updatedAt: toIso(row.updated_at) ?? "",
  };
}

function redactSensitiveValue(value: unknown, key = ""): unknown {
  const normalizedKey = key.toLowerCase();
  const sensitive = [
    "signature",
    "secret",
    "password",
    "authorization",
    "api_key",
    "apikey",
    "attachment",
    "content",
  ].some((fragment) => normalizedKey.includes(fragment));

  if (sensitive) {
    return "[redacted]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as JsonRecord).map(([entryKey, entryValue]) => [
        entryKey,
        redactSensitiveValue(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

function serializeRawPayload(payload: JsonRecord) {
  return JSON.stringify(redactSensitiveValue(payload));
}

function formSubmissionValues(
  id: string,
  submissionType: SubmissionType,
  input: SubmissionInput,
) {
  return [
    id,
    submissionType,
    input.timestamp,
    input.submittedAtIstDisplay,
    optional(input.fullName),
    optional(input.emailAddress),
    optional(input.phoneOrWhatsapp),
    optional(input.subject),
    optional(input.message),
    optional(input.companyOrOrganization),
    optional(input.solutionType),
    optional(input.requirementsDescription),
    optional(input.preferredTimeline),
    optional(input.sourcePage),
    optional(input.purchaseType),
    optional(input.productId),
    optional(input.productSlug),
    optional(input.productName),
    optional(input.selectedPlanId),
    optional(input.selectedPlanName),
    optional(input.subscriptionDuration),
    optional(input.originalProductPrice),
    optional(input.couponCode),
    optional(input.discountAmount),
    optional(input.finalPayablePrice),
    optional(input.amountPaid),
    optional(input.cryptoToken),
    optional(input.cryptoNetwork),
    optional(input.cryptoWalletAddress),
    optional(input.transactionHash),
    input.clientIpHash,
    input.userAgent,
    serializeRawPayload(input.rawPayload),
  ];
}

async function insertSubmission(
  client: PoolClient,
  submissionType: SubmissionType,
  input: SubmissionInput,
  attachment?: AttachmentInput,
) {
  const submissionId = input.submissionId || randomUUID();
  await client.query(
    `INSERT INTO form_submissions (
      id, submission_type, submitted_at, submitted_at_ist_display, full_name,
      email_address, phone_or_whatsapp, subject, message, company_or_organization,
      solution_type, requirements_description, preferred_timeline, source_page,
      purchase_type, product_id, product_slug, product_name, selected_plan_id,
      selected_plan_name, subscription_duration, original_product_price, coupon_code,
      discount_amount, final_payable_price, amount_paid, crypto_token, crypto_network,
      crypto_wallet_address, transaction_hash, client_ip_hash, user_agent, raw_payload
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
      $30, $31, $32, $33::jsonb
    )`,
    formSubmissionValues(submissionId, submissionType, input),
  );

  if (attachment) {
    await client.query(
      `INSERT INTO submission_attachments (
        id, submission_id, attachment_kind, filename, safe_filename, content_type,
        size_bytes, sha256_hash, storage_bucket, storage_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        attachment.id,
        submissionId,
        attachment.kind,
        attachment.filename,
        attachment.safeFilename,
        attachment.contentType,
        attachment.sizeBytes,
        attachment.sha256Hash,
        attachment.storageBucket,
        attachment.storagePath,
      ],
    );
  }

  return { id: submissionId };
}

async function saveSubmission(
  submissionType: SubmissionType,
  input: SubmissionInput,
  attachment?: AttachmentInput,
) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      const result = await insertSubmission(client, submissionType, input, attachment);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export function hasProductionPersistence() {
  return isProductionPersistenceConfigured();
}

export function persistenceLaunchBlocker() {
  return !hasProductionPersistence();
}

export function hashClientIp(ip: string) {
  if (!appConfig.ipHashSalt || !ip || ip === "unknown") {
    return "";
  }

  return createHash("sha256")
    .update(`${appConfig.ipHashSalt}:${ip}`)
    .digest("hex");
}

export function hashRazorpaySignature(signature: string) {
  return createHash("sha256").update(signature).digest("hex");
}

export function summarizePersistenceError(_error: unknown) {
  void _error;
  return "The delivery provider returned an error.";
}

export async function saveContactSubmission(input: ContactSubmissionInput) {
  return saveSubmission("contact", input);
}

export async function saveCustomSolutionSubmission(
  input: CustomSolutionSubmissionInput,
) {
  return saveSubmission("custom_solution", input, input.attachment);
}

export async function saveCryptoPaymentQuerySubmission(
  input: CryptoPaymentQuerySubmissionInput,
) {
  return saveSubmission("crypto_payment_query", input);
}

export async function saveCryptoPaymentProofSubmission(
  input: CryptoPaymentProofSubmissionInput,
) {
  return saveSubmission("crypto_payment_proof", input, input.attachment);
}

export async function updateSubmissionEmailStatus(
  id: string,
  status: EmailStatus,
  error?: string,
) {
  await queryDb(
    `UPDATE form_submissions
     SET email_status = $2, email_error = $3, updated_at = now()
     WHERE id = $1`,
    [id, status, status === "failed" ? optional(error) : null],
  );
}

export async function upsertCourseRegistration(
  input: UpsertCourseRegistrationInput,
) {
  const userId = requiredTrimmed(input.userId, "User ID");
  const fullName = requiredTrimmed(input.fullName, "Full name");
  const email = normalizeEmailAddress(input.email);
  const whatsappNumber = requiredTrimmed(input.whatsappNumber, "WhatsApp number");
  const courseSlug = input.courseSlug?.trim() || "algo-trading";

  const result = await queryDb<CourseRegistrationRow>(
    `INSERT INTO course_registrations (
      user_id, full_name, email, whatsapp_number, course_slug, access_status,
      payment_status, login_provider, source, utm_source, utm_medium,
      utm_campaign, hidden_bonus_agent_access_eligible
    ) VALUES (
      $1, $2, $3, $4, $5, COALESCE($6::text, 'free_access'),
      COALESCE($7::text, 'unpaid'), COALESCE($8::text, 'email_password'), $9,
      $10, $11, $12, COALESCE($13::boolean, false)
    ) ON CONFLICT (user_id, course_slug) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      whatsapp_number = EXCLUDED.whatsapp_number,
      access_status = COALESCE($6::text, course_registrations.access_status),
      payment_status = COALESCE($7::text, course_registrations.payment_status),
      login_provider = COALESCE($8::text, course_registrations.login_provider),
      source = COALESCE(EXCLUDED.source, course_registrations.source),
      utm_source = COALESCE(EXCLUDED.utm_source, course_registrations.utm_source),
      utm_medium = COALESCE(EXCLUDED.utm_medium, course_registrations.utm_medium),
      utm_campaign = COALESCE(EXCLUDED.utm_campaign, course_registrations.utm_campaign),
      hidden_bonus_agent_access_eligible = COALESCE(
        $13::boolean,
        course_registrations.hidden_bonus_agent_access_eligible
      ),
      updated_at = now()
    RETURNING *`,
    [
      userId,
      fullName,
      email,
      whatsappNumber,
      courseSlug,
      optional(input.accessStatus),
      optional(input.paymentStatus),
      optional(input.loginProvider),
      optional(input.source?.trim()),
      optional(input.utmSource?.trim()),
      optional(input.utmMedium?.trim()),
      optional(input.utmCampaign?.trim()),
      input.hiddenBonusAgentAccessEligible ?? null,
    ],
  );

  return toCourseRegistration(result.rows[0]);
}

export async function getCourseRegistrationByUserId(
  userId: string,
  courseSlug = "algo-trading",
) {
  const result = await queryDb<CourseRegistrationRow>(
    `SELECT *
     FROM course_registrations
     WHERE user_id = $1 AND course_slug = $2
     LIMIT 1`,
    [
      requiredTrimmed(userId, "User ID"),
      requiredTrimmed(courseSlug, "Course slug"),
    ],
  );

  return result.rows[0] ? toCourseRegistration(result.rows[0]) : null;
}

export async function getCourseRegistrationByEmail(
  email: string,
  courseSlug = "algo-trading",
) {
  const result = await queryDb<CourseRegistrationRow>(
    `SELECT *
     FROM course_registrations
     WHERE lower(email) = $1 AND course_slug = $2
     ORDER BY registered_at DESC
     LIMIT 1`,
    [
      normalizeEmailAddress(email),
      requiredTrimmed(courseSlug, "Course slug"),
    ],
  );

  return result.rows[0] ? toCourseRegistration(result.rows[0]) : null;
}

export async function updateCourseRegistrationLastLogin(
  userId: string,
  courseSlug = "algo-trading",
) {
  const result = await queryDb<CourseRegistrationRow>(
    `UPDATE course_registrations
     SET last_login_at = now(), updated_at = now()
     WHERE user_id = $1 AND course_slug = $2
     RETURNING *`,
    [
      requiredTrimmed(userId, "User ID"),
      requiredTrimmed(courseSlug, "Course slug"),
    ],
  );

  return result.rows[0] ? toCourseRegistration(result.rows[0]) : null;
}

function buildCourseRegistrationAdminFilters(
  filters: Omit<CourseRegistrationListFilters, "limit" | "offset">,
) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const addClause = (sql: string, value: unknown) => {
    params.push(value);
    clauses.push(sql.replace("?", `$${params.length}`));
  };

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const placeholder = `$${params.length}`;
    clauses.push(
      `(full_name ILIKE ${placeholder} OR email ILIKE ${placeholder} OR whatsapp_number ILIKE ${placeholder})`,
    );
  }

  if (filters.accessStatus) {
    addClause("access_status = ?", filters.accessStatus);
  }

  if (filters.paymentStatus) {
    addClause("payment_status = ?", filters.paymentStatus);
  }

  if (filters.loginProvider) {
    addClause("login_provider = ?", filters.loginProvider);
  }

  if (filters.courseSlug) {
    addClause("course_slug = ?", filters.courseSlug);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function listCourseRegistrations(
  filters: CourseRegistrationListFilters,
) {
  const sanitizedFilters = {
    search: filters.search?.trim() || undefined,
    accessStatus: filters.accessStatus,
    paymentStatus: filters.paymentStatus,
    loginProvider: filters.loginProvider,
    courseSlug: filters.courseSlug?.trim() || undefined,
  };
  const { whereSql, params } = buildCourseRegistrationAdminFilters(
    sanitizedFilters,
  );
  const countResult = await queryDb<QueryResultRow & { total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM course_registrations
     ${whereSql}`,
    params,
  );
  const rowParams = [...params, filters.limit, filters.offset];
  const rowsResult = await queryDb<CourseRegistrationRow>(
    `SELECT *
     FROM course_registrations
     ${whereSql}
     ORDER BY registered_at DESC
     LIMIT $${rowParams.length - 1} OFFSET $${rowParams.length}`,
    rowParams,
  );

  return {
    registrations: rowsResult.rows.map(toCourseRegistrationAdminRow),
    total: Number(countResult.rows[0]?.total ?? 0),
  };
}

export async function updateCourseRegistrationAdminStatus(
  id: string,
  input: UpdateCourseRegistrationAdminInput,
) {
  const updates: string[] = [];
  const params: unknown[] = [];
  const addUpdate = (sql: string, value: unknown) => {
    params.push(value);
    updates.push(sql.replace("?", `$${params.length}`));
  };

  if (input.accessStatus) {
    addUpdate("access_status = ?", input.accessStatus);
  }

  if (input.paymentStatus) {
    addUpdate("payment_status = ?", input.paymentStatus);
  }

  if (updates.length === 0) {
    throw new Error("No course registration admin status updates provided.");
  }

  params.push(requiredTrimmed(id, "Registration ID"));
  const result = await queryDb<CourseRegistrationRow>(
    `UPDATE course_registrations
     SET ${updates.join(", ")}, updated_at = now()
     WHERE id = $${params.length}
     RETURNING *`,
    params,
  );

  return result.rows[0] ? toCourseRegistrationAdminRow(result.rows[0]) : null;
}

export async function saveRazorpayOrder(input: RazorpayOrderInput) {
  await queryDb(
    `INSERT INTO razorpay_orders (
      id, razorpay_order_id, target_type, order_created_at, order_created_at_ist_display,
      customer_name, customer_email, product_id, product_slug, product_name, expert_id,
      expert_slug, expert_name, session_id, session_label, session_duration_minutes,
      slot_start_utc, appointment_date, appointment_slot, selected_plan_id,
      selected_plan_name, subscription_duration, original_price_usd, discount_usd,
      final_price_usd, coupon_code, usd_to_inr_rate, usd_to_inr_rate_source,
      exchange_rate_fetched_at_utc, exchange_rate_fetched_at_ist_display,
      exchange_rate_is_fallback, usd_to_inr_effective_date_ist, final_price_inr,
      amount_paise, currency, client_ip_hash, user_agent, raw_notes, raw_order
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
      $29, $30, $31, $32, $33, $34, $35, $36, $37, $38::jsonb, $39::jsonb
    ) ON CONFLICT (razorpay_order_id) DO UPDATE SET
      raw_notes = EXCLUDED.raw_notes,
      raw_order = EXCLUDED.raw_order,
      updated_at = now()`,
    [
      randomUUID(),
      input.razorpayOrderId,
      input.targetType,
      input.orderCreatedAt,
      optional(input.orderCreatedAtIstDisplay),
      input.customerName,
      input.customerEmail,
      optional(input.productId),
      optional(input.productSlug),
      optional(input.productName),
      optional(input.expertId),
      optional(input.expertSlug),
      optional(input.expertName),
      optional(input.sessionId),
      optional(input.sessionLabel),
      optional(input.sessionDurationMinutes),
      optional(input.slotStartUtc),
      optional(input.appointmentDate),
      optional(input.appointmentSlot),
      optional(input.selectedPlanId),
      optional(input.selectedPlanName),
      optional(input.subscriptionDuration),
      optional(input.originalPriceUsd),
      optional(input.discountUsd),
      optional(input.finalPriceUsd),
      optional(input.couponCode),
      optional(input.usdToInrRate),
      optional(input.usdToInrRateSource),
      optional(input.exchangeRateFetchedAtUtc),
      optional(input.exchangeRateFetchedAtIstDisplay),
      input.exchangeRateIsFallback ?? false,
      optional(input.usdToInrEffectiveDateIst),
      optional(input.finalPriceInr),
      input.amountPaise,
      input.currency,
      input.clientIpHash,
      input.userAgent,
      serializeRawPayload(input.rawNotes),
      serializeRawPayload(input.rawOrder),
    ],
  );
}

export async function upsertRazorpayVerifiedPayment(
  input: RazorpayVerifiedPaymentInput,
) {
  return withDbClient(async (client) => {
    const insertResult = await client.query<StoredPaymentRow>(
      `INSERT INTO razorpay_payments (
        id, razorpay_payment_id, razorpay_order_id, purchase_type, verified_at,
        verified_at_ist_display, captured_at_utc, captured_at_ist_display,
        customer_phone, booking_status, razorpay_signature_hash, raw_payment,
        raw_verification_payload
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb
      ) ON CONFLICT (razorpay_payment_id) DO NOTHING
      RETURNING *`,
      [
        randomUUID(),
        input.razorpayPaymentId,
        input.razorpayOrderId,
        input.purchaseType,
        input.verifiedAt,
        optional(input.verifiedAtIstDisplay),
        optional(input.capturedAtUtc),
        optional(input.capturedAtIstDisplay),
        optional(input.customerPhone),
        input.bookingStatus,
        input.razorpaySignatureHash,
        serializeRawPayload(input.rawPayment),
        serializeRawPayload(input.rawVerificationPayload),
      ],
    );

    if (insertResult.rows[0]) {
      return { created: true, payment: toStoredPayment(insertResult.rows[0]) };
    }

    const existing = await client.query<StoredPaymentRow>(
      "SELECT * FROM razorpay_payments WHERE razorpay_payment_id = $1",
      [input.razorpayPaymentId],
    );
    const payment = existing.rows[0];

    if (!payment) {
      throw new Error("The verified payment could not be loaded.");
    }

    return { created: false, payment: toStoredPayment(payment) };
  });
}

export async function updateRazorpayPaymentEmailStatus(
  razorpayPaymentId: string,
  status: EmailStatus,
  error?: string,
) {
  await queryDb(
    `UPDATE razorpay_payments
     SET email_status = $2, email_error = $3, updated_at = now()
     WHERE razorpay_payment_id = $1`,
    [razorpayPaymentId, status, status === "failed" ? optional(error) : null],
  );
}

export async function updateRazorpayPaymentBookingStatus(
  razorpayPaymentId: string,
  fields: {
    bookingStatus: "confirmed" | "manual_followup_required";
    calBookingUid?: string;
    calBookingStatus?: string;
    calMeetingUrl?: string;
    supportFollowupRequired?: boolean;
    bookingErrorSummary?: string;
  },
) {
  await queryDb(
    `UPDATE razorpay_payments
     SET booking_status = $2,
         cal_booking_uid = $3,
         cal_booking_status = $4,
         cal_meeting_url = $5,
         support_followup_required = $6,
         booking_error_summary = $7,
         updated_at = now()
     WHERE razorpay_payment_id = $1`,
    [
      razorpayPaymentId,
      fields.bookingStatus,
      optional(fields.calBookingUid),
      optional(fields.calBookingStatus),
      optional(fields.calMeetingUrl),
      fields.supportFollowupRequired ?? false,
      optional(fields.bookingErrorSummary),
    ],
  );
}

export type SubmissionListFilters = {
  type?: SubmissionType;
  limit: number;
  offset: number;
  email?: string;
  from?: string;
  to?: string;
};

export type AdminSubmission = QueryResultRow & {
  id: string;
  submission_type: SubmissionType;
  submitted_at: string;
  email_address: string | null;
  attachments: Array<{
    id: string;
    attachment_kind: string;
    filename: string;
    safe_filename: string;
    content_type: string;
    size_bytes: number;
    sha256_hash: string;
    storage_provider: string;
    created_at: string;
  }>;
};

export async function listFormSubmissions(filters: SubmissionListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const addClause = (sql: string, value: unknown) => {
    params.push(value);
    clauses.push(sql.replace("?", `$${params.length}`));
  };

  if (filters.type) addClause("s.submission_type = ?", filters.type);
  if (filters.email) addClause("s.email_address ILIKE ?", `%${filters.email}%`);
  if (filters.from) addClause("s.submitted_at >= ?", filters.from);
  if (filters.to) addClause("s.submitted_at <= ?", filters.to);
  params.push(filters.limit, filters.offset);

  const result = await queryDb<AdminSubmission>(
    `SELECT s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'attachment_kind', a.attachment_kind,
            'filename', a.filename,
            'safe_filename', a.safe_filename,
            'content_type', a.content_type,
            'size_bytes', a.size_bytes,
            'sha256_hash', a.sha256_hash,
            'storage_provider', a.storage_provider,
            'created_at', a.created_at
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
      ) AS attachments
     FROM form_submissions s
     LEFT JOIN submission_attachments a ON a.submission_id = s.id
     ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
     GROUP BY s.id
     ORDER BY s.submitted_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return result.rows;
}

export async function getSubmissionAttachment(
  submissionId: string,
  attachmentId: string,
) {
  const result = await queryDb<
    QueryResultRow & {
      id: string;
      filename: string;
      safe_filename: string;
      content_type: string;
      size_bytes: number;
      storage_bucket: string;
      storage_path: string;
    }
  >(
    `SELECT id, filename, safe_filename, content_type, size_bytes, storage_bucket, storage_path
     FROM submission_attachments
     WHERE id = $1 AND submission_id = $2`,
    [attachmentId, submissionId],
  );
  return result.rows[0] ?? null;
}

export type RazorpayPaymentListFilters = {
  purchaseType?: PurchaseType;
  limit: number;
  offset: number;
  email?: string;
  from?: string;
  to?: string;
};

export async function listRazorpayPayments(filters: RazorpayPaymentListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const addClause = (sql: string, value: unknown) => {
    params.push(value);
    clauses.push(sql.replace("?", `$${params.length}`));
  };

  if (filters.purchaseType) addClause("p.purchase_type = ?", filters.purchaseType);
  if (filters.email) addClause("o.customer_email ILIKE ?", `%${filters.email}%`);
  if (filters.from) addClause("p.verified_at >= ?", filters.from);
  if (filters.to) addClause("p.verified_at <= ?", filters.to);
  params.push(filters.limit, filters.offset);

  const result = await queryDb(
    `SELECT
      p.razorpay_payment_id, p.razorpay_order_id, p.purchase_type, p.verified_at,
      p.verified_at_ist_display, p.captured_at_utc, p.captured_at_ist_display,
      p.customer_phone, p.email_status, p.email_error, p.booking_status,
      p.cal_booking_uid, p.cal_booking_status, p.cal_meeting_url,
      p.support_followup_required, p.booking_error_summary, p.raw_payment,
      p.raw_verification_payload, p.created_at AS payment_created_at,
      p.updated_at AS payment_updated_at, o.target_type, o.order_created_at,
      o.order_created_at_ist_display, o.customer_name, o.customer_email,
      o.product_id, o.product_slug, o.product_name, o.expert_id, o.expert_slug,
      o.expert_name, o.session_id, o.session_label, o.session_duration_minutes,
      o.slot_start_utc, o.appointment_date, o.appointment_slot,
      o.selected_plan_id, o.selected_plan_name, o.subscription_duration,
      o.original_price_usd, o.discount_usd, o.final_price_usd, o.coupon_code,
      o.usd_to_inr_rate, o.usd_to_inr_rate_source,
      o.exchange_rate_fetched_at_utc, o.exchange_rate_fetched_at_ist_display,
      o.exchange_rate_is_fallback, o.usd_to_inr_effective_date_ist,
      o.final_price_inr, o.amount_paise, o.currency, o.status, o.raw_notes,
      o.raw_order
     FROM razorpay_payments p
     INNER JOIN razorpay_orders o ON o.razorpay_order_id = p.razorpay_order_id
     ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
     ORDER BY p.verified_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return result.rows;
}
